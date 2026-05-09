import { Controller, Get, Query, Param } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { messages } from '@jarvis/database';
import { desc, eq } from 'drizzle-orm';

@Controller('history')
export class HistoryController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getConversations() {
    // Basic implementation to get all messages grouped by conversationId
    return this.databaseService.db.select().from(messages).orderBy(desc(messages.createdAt)).limit(50);
  }

  @Get(':conversationId')
  async getMessages(@Param('conversationId') id: string) {
    return this.databaseService.db.select().from(messages).where(eq(messages.conversationId, id as any)).orderBy(desc(messages.createdAt));
  }
}
