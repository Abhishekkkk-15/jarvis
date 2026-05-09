import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AIService } from '../services/ai.service';
import { ToolService } from '../services/tool.service';
import { DatabaseService } from '../database/database.service';
import { messages } from '@jarvis/database';

import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { SafetyService } from '../services/safety.service';

import { ExecutionService } from '../services/execution.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private pendingApprovals = new Map<string, { resolve: (val: boolean) => void }>();

  constructor(
    private readonly aiService: AIService,
    private readonly toolService: ToolService,
    private readonly databaseService: DatabaseService,
    private readonly safetyService: SafetyService,
    private readonly executionService: ExecutionService,
  ) {
    // Stream all tool events to all connected clients (or specific rooms if needed)
    this.executionService.onEvent((event) => {
      if (event.type === 'start') {
        this.server.emit('toolStart', { name: event.toolName, id: event.id });
      } else if (event.type === 'end') {
        this.server.emit('toolEnd', { id: event.id, result: event.result });
      } else if (event.type === 'error') {
        this.server.emit('toolEnd', { id: event.id, result: { error: event.error } });
      }
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { content: string; conversationId?: string }) {
    const DEFAULT_CONVERSATION_ID = '00000000-0000-0000-0000-000000000000';
    const conversationId = payload.conversationId && payload.conversationId !== 'default' 
      ? payload.conversationId 
      : DEFAULT_CONVERSATION_ID;

    // 1. Save user message to DB
    await this.databaseService.db.insert(messages).values({
      content: payload.content,
      role: 'user',
      conversationId,
    });

    const conversationHistory: any[] = [new HumanMessage(payload.content)];
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const stream = await this.aiService.streamResponse(conversationHistory);
      
      let fullContent = '';
      let toolCalls: any[] = [];

      for await (const chunk of stream) {
        if (chunk.content) {
          fullContent += chunk.content;
          client.emit('chatUpdate', { content: fullContent, isFinal: false });
        }
        
        if (chunk.additional_kwargs?.tool_calls) {
          toolCalls = [...toolCalls, ...chunk.additional_kwargs.tool_calls];
        }
      }

      // After stream completes, create ONE AIMessage with content and tool calls
      const aiMessage = new AIMessage({ 
        content: fullContent || '', 
        additional_kwargs: toolCalls.length > 0 ? { tool_calls: toolCalls } : {} 
      });
      conversationHistory.push(aiMessage);

      if (toolCalls.length > 0) {
        const toolResults: ToolMessage[] = [];
        
        for (const toolCall of toolCalls) {
          const name = toolCall.function?.name;
          const args = JSON.parse(toolCall.function?.arguments || '{}');
          
          const result = await this.executionService.runTool(name, args, toolCall.id, async (id) => {
            client.emit('chatUpdate', { content: `⏳ Jarvis is using tool: **${name}**...`, isFinal: false });
            client.emit('toolApprovalRequired', { name, id, args });
            return new Promise<boolean>((resolve) => {
              this.pendingApprovals.set(id, { resolve });
            });
          });

          client.emit('chatUpdate', { content: `✅ Completed: **${name}**`, isFinal: false });
          toolResults.push(new ToolMessage({ 
            tool_call_id: toolCall.id, 
            content: typeof result === 'string' ? result : JSON.stringify(result) 
          }));
        }

        conversationHistory.push(...toolResults);
      } else {
        // No tool calls, we are done
        client.emit('chatUpdate', { content: fullContent, isFinal: true });
        
        // 3. Save AI response to DB
        await this.databaseService.db.insert(messages).values({
          content: fullContent,
          role: 'assistant',
          conversationId,
        });
        break;
      }
    }
  }

  @SubscribeMessage('approveTool')
  handleApproveTool(client: Socket, payload: { id: string; approved: boolean }) {
    const pending = this.pendingApprovals.get(payload.id);
    if (pending) {
      pending.resolve(payload.approved);
      this.pendingApprovals.delete(payload.id);
    }
  }
}
