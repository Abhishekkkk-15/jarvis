export * from './types';
export * from './AgentRuntime';
export * from './TaskManager';
export * from './PlannerAgent';
export * from './ReflectionAgent';
export * from './MemoryCoordinator';

import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { AIProvider } from '@jarvis/ai';
import { ToolRegistry } from '@jarvis/tools';

interface AgentState {
  messages: BaseMessage[];
}

// Legacy JarvisAgent preserved for backward compatibility
export class JarvisAgent {
  private workflow: StateGraph<AgentState>;

  constructor(private aiProvider: AIProvider, private toolRegistry: ToolRegistry) {
    this.workflow = new StateGraph<AgentState>({
      channels: {
        messages: {
          value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
          default: () => [],
        },
      },
    });

    this.setupWorkflow();
  }

  private setupWorkflow() {
    this.workflow.addNode('agent', async (state) => {
      const model = this.aiProvider.getModel();
      const tools = this.toolRegistry.getJsonSchemas().map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));

      const response = await (model as any).bind({ tools }).invoke(state.messages);
      return { messages: [response] };
    });

    this.workflow.addNode('tools', async (state) => {
      const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
      const results: ToolMessage[] = [];

      if (lastMessage.tool_calls) {
        for (const toolCall of lastMessage.tool_calls) {
          const tool = this.toolRegistry.getTool(toolCall.name);
          if (tool) {
            const result = await tool.execute(toolCall.args);
            results.push(new ToolMessage({
              tool_call_id: toolCall.id || 'unknown',
              content: JSON.stringify(result),
            }));
          }
        }
      }
      return { messages: results };
    });

    this.workflow.setEntryPoint('agent');
    this.workflow.addConditionalEdges('agent', (state: AgentState) => {
      const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
      return lastMessage.tool_calls && lastMessage.tool_calls.length > 0 ? 'tools' : END;
    });
    this.workflow.addEdge('tools', 'agent');
  }

  async run(input: string) {
    const app = this.workflow.compile();
    return app.invoke({
      messages: [new HumanMessage(input)],
    });
  }
}
