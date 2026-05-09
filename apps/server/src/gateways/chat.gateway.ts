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
  ) {}

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

      if (fullContent) {
        conversationHistory.push(new AIMessage(fullContent));
      }

      if (toolCalls.length > 0) {
        const toolResults: ToolMessage[] = [];
        
        for (const toolCall of toolCalls) {
          const name = toolCall.function?.name;
          const args = JSON.parse(toolCall.function?.arguments || '{}');
          
          client.emit('toolStart', { name, id: toolCall.id });

          // Safety Check
          if (this.safetyService.isDangerous(name)) {
            client.emit('toolApprovalRequired', { name, id: toolCall.id, args });
            const approved = await new Promise<boolean>((resolve) => {
              this.pendingApprovals.set(toolCall.id, { resolve });
            });
            
            if (!approved) {
              const result = { error: 'User denied permission' };
              client.emit('toolEnd', { id: toolCall.id, result });
              toolResults.push(new ToolMessage({ tool_call_id: toolCall.id, content: JSON.stringify(result) }));
              continue;
            }
          }

          try {
            const result = await this.toolService.executeTool(name, args);
            client.emit('toolEnd', { id: toolCall.id, result });
            toolResults.push(new ToolMessage({ tool_call_id: toolCall.id, content: JSON.stringify(result) }));
          } catch (error: any) {
            client.emit('toolEnd', { id: toolCall.id, result: { error: error.message } });
            toolResults.push(new ToolMessage({ tool_call_id: toolCall.id, content: JSON.stringify({ error: error.message }) }));
          }
        }

        // Add tool calls and results to history for next iteration
        // IMPORTANT: The AI message with tool_calls must come BEFORE the ToolMessages
        conversationHistory.push(new AIMessage({ content: fullContent, additional_kwargs: { tool_calls: toolCalls } }));
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
