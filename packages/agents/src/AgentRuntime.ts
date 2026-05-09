import { AIProvider } from '@jarvis/ai';
import { ToolRegistry } from '@jarvis/tools';
import { TaskManager } from './TaskManager';
import { PlannerAgent } from './PlannerAgent';
import { ReflectionAgent } from './ReflectionAgent';
import { AgentTask, TaskStep } from './types';
import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';

export class AgentRuntime {
  private planner: PlannerAgent;
  private reflection: ReflectionAgent;
  private taskManager: TaskManager;

  constructor(
    private aiProvider: AIProvider,
    private toolRegistry: ToolRegistry,
    db: any,
    schema: any
  ) {
    this.planner = new PlannerAgent(aiProvider);
    this.reflection = new ReflectionAgent(aiProvider);
    this.taskManager = new TaskManager(db, schema);
  }

  async executeGoal(goal: string) {
    // 1. Create Task
    const taskId = await this.taskManager.createHistoryTask(goal);
    await this.taskManager.logEvent(taskId, 'plan', { message: 'Decomposing goal into steps' });

    try {
      // 2. Generate Plan
      const steps = await this.planner.generatePlan(goal);
      for (const step of steps) {
        await this.taskManager.createTaskStep(taskId, step.description, step.order);
      }

      await this.taskManager.updateTaskStatus(taskId, 'running');
      
      // 3. Execution Loop
      await this.runLoop(taskId);

    } catch (error: any) {
      await this.taskManager.updateTaskStatus(taskId, 'failed');
      await this.taskManager.logEvent(taskId, 'error', { message: error.message });
      throw error;
    }
  }

  private async runLoop(taskId: string) {
    const task = await this.taskManager.getTask(taskId);
    if (!task) return;

    for (const step of task.steps) {
      if (step.status === 'completed') continue;

      await this.taskManager.updateStep(step.id, { status: 'running' });
      await this.taskManager.logEvent(taskId, 'think', { message: `Executing step: ${step.description}` }, step.id);

      let success = false;
      let attempts = 0;
      const maxRetries = 3;

      while (!success && attempts < maxRetries) {
        try {
          // THINK & EXECUTE
          const result = await this.executeStep(task, step);
          
          // EVALUATE
          await this.taskManager.updateStep(step.id, { status: 'completed', result });
          await this.taskManager.logEvent(taskId, 'evaluate', { message: 'Step completed successfully', result }, step.id);
          success = true;

        } catch (error: any) {
          attempts++;
          await this.taskManager.logEvent(taskId, 'retry', { message: `Step failed: ${error.message}. Attempt ${attempts}/${maxRetries}` }, step.id);
          
          // REFLECT
          const reflection = await this.reflection.reflect(
            task.goal,
            step.description,
            error.message,
            JSON.stringify(task.steps.map(s => ({ desc: s.description, status: s.status })))
          );

          if (reflection.action === 'fail' || attempts >= maxRetries) {
            await this.taskManager.updateStep(step.id, { status: 'failed', error: error.message });
            throw new Error(`Task failed at step: ${step.description}. ${error.message}`);
          }
          
          if (reflection.action === 'modify_plan') {
            // TODO: Implement dynamic re-planning logic
            await this.taskManager.logEvent(taskId, 'plan', { message: 'Plan modification requested by ReflectionAgent', analysis: reflection.analysis }, step.id);
          }
        }
      }
    }

    await this.taskManager.updateTaskStatus(taskId, 'completed');
    await this.taskManager.logEvent(taskId, 'complete', { message: 'All steps completed' });
  }

  private async executeStep(task: AgentTask, step: TaskStep): Promise<any> {
    const model = this.aiProvider.getModel();
    const tools = this.toolRegistry.getJsonSchemas().map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    // Construct context
    const messages = [
      new HumanMessage(`Current Goal: ${task.goal}\n\nCurrent Step to execute: ${step.description}\n\nPrevious steps status: ${JSON.stringify(task.steps.filter(s => s.status === 'completed').map(s => s.description))}\n\nPlease choose the appropriate tool to complete this step. If no tool is needed, respond with text.`)
    ];

    const response = await (model as any).bind({ tools }).invoke(messages);
    
    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0];
      const tool = this.toolRegistry.getTool(toolCall.name);
      
      if (!tool) throw new Error(`Tool ${toolCall.name} not found`);

      await this.taskManager.updateStep(step.id, { toolCall });
      await this.taskManager.logEvent(task.id, 'execute', { tool: toolCall.name, args: toolCall.args }, step.id);

      const result = await tool.execute(toolCall.args);
      return result;
    }

    return { message: response.content };
  }
}
