import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AIService } from './ai.service';
import { memories } from '@jarvis/database';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class MemoryService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly aiService: AIService,
  ) {}

  async storeMemory(content: string, metadata: any = {}) {
    // 1. Get embeddings
    const provider = await this.aiService.getProvider();
    if (!provider) return;
    
    const embeddings = await provider.getEmbeddings().embedQuery(content);
    
    // 2. Store in DB
    await this.databaseService.db.insert(memories).values({
      content,
      metadata,
      vector: JSON.stringify(embeddings), // Storing as JSON string for now if pgvector is missing
    });
  }

  async searchMemories(query: string, limit: number = 5) {
    // If we had pgvector, we would do a cosine similarity search here.
    // For now, we'll do a simple text search as fallback.
    return this.databaseService.db
      .select()
      .from(memories)
      .where(sql`content ILIKE ${'%' + query + '%'}`)
      .limit(limit);
  }
}
