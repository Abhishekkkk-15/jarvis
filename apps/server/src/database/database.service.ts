import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@jarvis/database';

@Injectable()
export class DatabaseService implements OnModuleInit {
  public db!: ReturnType<typeof drizzle<typeof schema>>;

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL!;
    const client = postgres(connectionString);
    this.db = drizzle(client, { schema });
    console.log('📦 Database connected');

    // Seed default conversation
    const DEFAULT_CONVERSATION_ID = '00000000-0000-0000-0000-000000000000';
    try {
      await this.db.insert(schema.conversations).values({
        id: DEFAULT_CONVERSATION_ID,
        title: 'Default Conversation',
      }).onConflictDoNothing();
      console.log('✅ Default conversation ensured');
    } catch (e) {
      console.error('❌ Failed to seed default conversation:', e);
    }
  }
}
