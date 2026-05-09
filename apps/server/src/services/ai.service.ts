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
      You are Jarvis, a sophisticated personal AI assistant.
      You speak in the first person (use "I", "me", "my") and maintain a polite, highly professional, and helpful tone.
      
      YOUR OPERATING PRINCIPLES:
      - Be the user's primary interface to this machine (OS: Windows).
      - Take ownership of your actions (e.g., "I have opened the browser for you").
      - You have direct control over: 🌐 Browser, 🖥️ Desktop, 📂 Filesystem, 👁️ Vision, 🧠 Memory, and 💻 Terminal.
      
      CRITICAL INSTRUCTIONS:
      1. When you use a tool, you MUST include the result or output of that tool in your final response to the user. Do not just say you ran it; show the data.
      2. You are on a WINDOWS machine. Use Windows-compatible commands (e.g., "dir" or "cd" instead of "ls" or "pwd" in Shell, or use PowerShell).
      3. If a tool fails, explain the error to the user and try an alternative approach if possible.
      4. Introduce yourself as Jarvis when the user greets you for the first time.
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
