import { eq, asc } from 'drizzle-orm';
import { AgentTask, TaskStep, ExecutionEvent } from './types';

export class TaskManager {
  constructor(private db: any, private schema: any) {}

  async createHistoryTask(goal: string): Promise<string> {
    const result = await this.db.insert(this.schema.agentTasks).values({
      goal,
      status: 'pending',
      context: {},
    }).returning({ id: this.schema.agentTasks.id });
    return result[0].id;
  }

  async createTaskStep(taskId: string, description: string, order: string): Promise<string> {
    const result = await this.db.insert(this.schema.taskSteps).values({
      taskId,
      description,
      status: 'pending',
      order,
    }).returning({ id: this.schema.taskSteps.id });
    return result[0].id;
  }

  async updateTaskStatus(taskId: string, status: AgentTask['status']) {
    await this.db.update(this.schema.agentTasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(this.schema.agentTasks.id, taskId));
  }

  async updateStep(stepId: string, updates: Partial<TaskStep>) {
    await this.db.update(this.schema.taskSteps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(this.schema.taskSteps.id, stepId));
  }

  async logEvent(taskId: string, eventType: string, details: any, stepId?: string) {
    await this.db.insert(this.schema.executionEvents).values({
      taskId,
      stepId,
      eventType,
      details,
    });
  }

  async getTask(taskId: string): Promise<AgentTask | null> {
    const task = await this.db.select().from(this.schema.agentTasks).where(eq(this.schema.agentTasks.id, taskId)).limit(1);
    if (!task[0]) return null;

    const steps = await this.db.select()
      .from(this.schema.taskSteps)
      .where(eq(this.schema.taskSteps.taskId, taskId))
      .orderBy(asc(this.schema.taskSteps.order));

    return {
      ...task[0],
      steps,
    };
  }
}
