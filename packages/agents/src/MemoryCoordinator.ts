import { eq, and } from 'drizzle-orm';
import { AIProvider } from '@jarvis/ai';

export class MemoryCoordinator {
  constructor(private db: any, private schema: any, private aiProvider: AIProvider) {}

  async getContextForTask(taskId: string, goal: string) {
    // 1. Get Working Memory
    const workingMemory = await this.db.select()
      .from(this.schema.workingMemories)
      .where(eq(this.schema.workingMemories.taskId, taskId));

    // 2. Get Recent Short-term Context (from last few messages)
    // This would typically come from the conversation history

    // 3. Search Episodic Memory (Past tasks/outcomes)
    // For now, we'll do a simple semantic search or just fetch recent ones
    const episodic = await this.db.select()
      .from(this.schema.episodicMemories)
      .limit(3);

    return {
      working: workingMemory.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}),
      episodic: episodic.map((e: any) => e.summary),
    };
  }

  async saveEpisodicMemory(goal: string, steps: any[], success: boolean) {
    const summary = `Goal: ${goal}. Outcome: ${success ? 'Success' : 'Failure'}. Steps: ${steps.length}`;
    await this.db.insert(this.schema.episodicMemories).values({
      summary,
      outcomes: { success, steps },
    });
  }

  async setWorkingMemory(taskId: string, key: string, value: any) {
    await this.db.insert(this.schema.workingMemories).values({
      taskId,
      key,
      value,
    }).onConflictDoUpdate({
      target: [this.schema.workingMemories.taskId, this.schema.workingMemories.key],
      set: { value, updatedAt: new Date() },
    });
  }
}
