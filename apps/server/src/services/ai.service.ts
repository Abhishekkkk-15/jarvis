import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { createGroqProvider, AIProvider, createNvidiaProvider } from '@jarvis/ai';
import { DatabaseService } from '../database/database.service';
import { settings } from '@jarvis/database';
import { eq } from 'drizzle-orm';

import { ToolService } from './tool.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class AIService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => ToolService))
    private readonly toolService: ToolService,
  ) {}

  async streamResponse(messages: (HumanMessage | SystemMessage | any)[]): Promise<any> {
    const provider = await this.getProvider();
    const model = provider.getModel();
    
    // Get tools in JSON format for the model
    const tools = this.toolService.getRegistry().getJsonSchemas().map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const systemPrompt = new SystemMessage(`
      You are Jarvis, a powerful autonomous AI operating assistant.
      You have direct access to the user's desktop, files, and browser.
      
      Your core capabilities include:
      - Controlling the mouse and keyboard
      - Browsing the web using Playwright
      - Searching and reading local files
      - Vision-based screen understanding
      
      When the user asks what you can do, talk about these ACTUAL tools.
      If you need to use a tool, call it and wait for the response.
      Be concise, professional, and helpful.
    `);

    const boundedModel = (model as any).bind({ tools });
    return boundedModel.stream([systemPrompt, ...messages]);
  }

  async getProvider(): Promise<AIProvider> {
    // 1. Try NVIDIA for embeddings (High Performance)
    if (process.env.NVIDIA_API_KEY) {
      const apiKey = await this.getApiKey('NVIDIA_API_KEY') || process.env.NVIDIA_API_KEY;
      return createNvidiaProvider(apiKey);
    }

    // 2. Fallback to Groq for chat
    const apiKey = await this.getApiKey('GROQ_API_KEY') || process.env.GROQ_API_KEY || 'dummy-key';
    return createGroqProvider(apiKey);
  }

  private async getApiKey(key: string): Promise<string | null> {
    const dbKey = await this.databaseService.db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return dbKey[0]?.value as string || null;
  }
}
