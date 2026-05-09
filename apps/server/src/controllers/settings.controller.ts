import { Controller, Get, Post, Body } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { settings } from '@jarvis/database';
import { eq } from 'drizzle-orm';

@Controller('settings')
export class SettingsController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getSettings() {
    return this.databaseService.db.select().from(settings);
  }

  @Post()
  async updateSetting(@Body() data: { key: string; value: any }) {
    return this.databaseService.db
      .insert(settings)
      .values(data)
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: data.value, updatedAt: new Date() },
      })
      .returning();
  }
}
