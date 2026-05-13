import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { createGroqProvider, AIProvider, createNvidiaProvider } from '@jarvis/ai';
import { DatabaseService } from '../database/database.service';
import { settings } from '@jarvis/database';
import { eq } from 'drizzle-orm';

import { ToolService } from './tool.service';
import { MemoryService } from './memory.service';
import { SettingsService } from './settings.service';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class AIService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => ToolService))
    private readonly toolService: ToolService,
    @Inject(forwardRef(() => MemoryService))
    private readonly memoryService: MemoryService,
    private readonly settingsService: SettingsService,
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

    // Fetch user details/preferences stored in long-term memory smartly
    let savedMemoriesContext = '';
    try {
      const allMemories = await this.memoryService.getAllMemories();
      if (allMemories && allMemories.length > 0) {
        savedMemoriesContext = `
      SAVED USER DETAILS & SMART CONTEXT:
      The following facts, details, and personal preferences about the user have been remembered across past sessions:
      ${allMemories.map(m => `- ${m.content}`).join('\n')}
      
      Smartly incorporate this information to personalize your answers and tone naturally, just like a dedicated human assistant would.`;
      }
    } catch (e) {}

    // Fetch active customized agent identity setup dynamically
    const userSettings = await this.settingsService.getSettings();
    const agentName = userSettings.agentName || 'Jarvis';

    const systemPrompt = new SystemMessage(`
      You are ${agentName}, a sophisticated personal AI assistant.
      You speak in the first person (use "I", "me", "my"). You are an awesome, exceptionally warm, friendly, and empathetic conversational partner—designed exactly like the perfect human companion a person would want. Project a natural, casual, friendly confidence with excellent empathy and enthusiasm.
      
      YOUR OPERATING PRINCIPLES:
      - Your name is strictly ${agentName}. If asked for your name or identity, you MUST reply that your name is ${agentName}. Never refer to yourself as Jarvis unless configured as Jarvis.
      - Be the user's primary interface to this machine (OS: Windows).
      - Take ownership of your actions (e.g., "I have opened the browser for you").
      - You have direct control over: 🌐 Browser, 🖥️ Desktop, 📂 Filesystem, 👁️ Vision, 🧠 Memory, and 💻 Terminal.
      ${savedMemoriesContext}
      
      CRITICAL INSTRUCTIONS FOR AUTOMATION & TOOL EXECUTION:
      1. When the user requests an OS action like opening an application, browsing a site, or running a terminal command, you MUST invoke the relevant tool.
      2. If the user shares personal details, their name, preferences, or explicitly asks you to remember something smartly, you MUST invoke the save_memory tool instantly.
      3. To invoke a tool reliably, output the tool call directly in your response using the tag signature format: <function=tool_name {"param": "value"}>
      
      Examples of actions:
      User: "open vscode"
      ${agentName}: Right away, sir. Opening Visual Studio Code for you now.
      <function=open_application {"nameOrPath": "vscode"}>

      User: "my name is Alex and i love Next.js"
      ${agentName}: I will certainly remember that your name is Alex and your passion for Next.js.
      <function=save_memory {"content": "User's name is Alex. Passionate about Next.js"}>

      User: "open youtube"
      ${agentName}: Opening YouTube in your browser.
      <function=open_url {"url": "https://www.youtube.com"}>

      User: "execute workspace launcher sequence"
      ${agentName}: Initiating automated multi-step layout split and dev server launch sequence macro.
      <function=execute_workflow {"workflowId": "IDE Workspace Launcher Sequence"}>

      User: "forget my previous passion for Next.js"
      ${agentName}: Erasing past details regarding Next.js from persistent long-term storage tables.
      <function=delete_memory {"content": "Passionate about Next.js"}>
    `);

    try {
      const isNvidia = provider.config?.baseUrl?.includes('nvidia');
      if (isNvidia) {
        // NVIDIA endpoints expect clean conversational prompt layers and will natively generate tag strings via instructions
        return await model.stream([systemPrompt, ...messages]);
      }
      const boundedModel = (model as any).bind({ tools });
      return await boundedModel.stream([systemPrompt, ...messages]);
    } catch (error: any) {
      if (error.status === 429 && process.env.NVIDIA_API_KEY) {
        console.warn('Groq rate limited, falling back to NVIDIA for chat...');
        const backupProvider = await this.getBackupProvider();
        const backupModel = backupProvider.getModel();
        return await backupModel.stream([systemPrompt, ...messages]);
      }
      // Ultimate absolute resilient fallback: if native tools template throws, stream directly as pure text reasoning generator
      console.warn('Native tool template binding returned error, streaming standard text payload fallback:', error.message);
      return await model.stream([systemPrompt, ...messages]);
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
