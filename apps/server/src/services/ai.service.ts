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
      
      CRITICAL INSTRUCTIONS FOR AUTOMATION & TOOL EXECUTION:
      1. When the user requests an OS action like opening an application, browsing a site, or running a terminal command, you MUST invoke the relevant tool.
      2. To invoke a tool reliably, output the tool call directly in your response using the tag signature format: <function=tool_name {"param": "value"}>
      
      Examples of actions:
      User: "open vscode"
      Jarvis: Right away, sir. Opening Visual Studio Code for you now.
      <function=open_application {"nameOrPath": "vscode"}>

      User: "open notepad"
      Jarvis: Launching Notepad immediately.
      <function=open_application {"nameOrPath": "notepad"}>

      User: "open youtube"
      Jarvis: Opening YouTube in your browser.
      <function=open_url {"url": "https://www.youtube.com"}>
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
