import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AIService } from './ai.service';
import { memories } from '@jarvis/database';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class MemoryService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => AIService))
    private readonly aiService: AIService,
  ) {}

  async storeMemory(content: string, metadata: any = {}) {
    // 1. Get embeddings
    const provider = await this.aiService.getProvider();
    if (!provider) return { success: false, message: "AI provider unavailable" };
    
    const embeddings = await provider.getEmbeddings().embedQuery(content);
    
    // 2. Store in DB
    await this.databaseService.db.insert(memories).values({
      content,
      metadata,
      vector: JSON.stringify(embeddings),
    });

    return { success: true, message: `Successfully remembered: "${content}"` };
  }

  async searchMemories(query: string, limit: number = 5) {
    return this.databaseService.db
      .select()
      .from(memories)
      .where(sql`content ILIKE ${'%' + query + '%'}`)
      .limit(limit);
  }

  async getAllMemories() {
    return this.databaseService.db
      .select()
      .from(memories)
      .limit(50);
  }
}
