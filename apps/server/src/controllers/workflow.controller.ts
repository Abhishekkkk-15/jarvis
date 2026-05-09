import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { workflows } from '@jarvis/database';
import { desc } from 'drizzle-orm';

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async findAll() {
    return this.databaseService.db.select().from(workflows).orderBy(desc(workflows.createdAt));
  }

  @Post()
  async create(@Body() data: { name: string; description?: string; definition: any }) {
    return this.databaseService.db.insert(workflows).values(data).returning();
  }
}
