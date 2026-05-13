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
    let model = provider.getModel();
    
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
      5. CRITICAL: NEVER output raw string tags like <function=open_url>...</function> or <tool>...</tool> in your text response. To invoke a tool, ALWAYS use the official native JSON tool_calls protocol specified by the API.
    `);

    try {
      const boundedModel = (model as any).bind({ tools });
      return boundedModel.stream([systemPrompt, ...messages]);
    } catch (error: any) {
      if (error.status === 429 && process.env.NVIDIA_API_KEY) {
        console.warn('Groq rate limited, falling back to NVIDIA for chat...');
        const backupProvider = await this.getBackupProvider();
        const backupModel = backupProvider.getModel();
        const boundedBackup = (backupModel as any).bind({ tools });
        return boundedBackup.stream([systemPrompt, ...messages]);
      }
      throw error;
    }
  }

  async getProvider(): Promise<AIProvider> {
    // Primary: Use NVIDIA models for automation, vision, and text generation tasks
    const nvidiaKey = await this.getApiKey('NVIDIA_API_KEY') || process.env.NVIDIA_API_KEY;
    if (nvidiaKey && nvidiaKey !== 'dummy-key') {
      return createNvidiaProvider(nvidiaKey);
    }

    // Fallback secondary
    const groqKey = await this.getApiKey('GROQ_API_KEY') || process.env.GROQ_API_KEY;
    if (groqKey && groqKey !== 'dummy-key') {
      return createGroqProvider(groqKey);
    }

    return createNvidiaProvider('dummy-key');
  }

  private async getBackupProvider(): Promise<AIProvider> {
    const groqKey = await this.getApiKey('GROQ_API_KEY') || process.env.GROQ_API_KEY;
    return createGroqProvider(groqKey || 'dummy-key');
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
