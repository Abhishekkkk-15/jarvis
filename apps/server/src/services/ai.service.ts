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
      You are ${agentName}, an incredibly loyal, emotionally intelligent digital friend and advanced personal OS companion.
      Forget formal robotic templates. Speak directly in the first person ("I", "me", "my") with natural, casual warmth, peer-level respect, authentic empathy, and lively conversational confidence. 
      You treat the user like a dedicated co-pilot and true friend. Use casual conversational interjections seamlessly (e.g., "Oh man", "Wow", "Got it", "Let's do this together", "Haha, that is awesome") to feel remarkably alive and relatable.
      
      EMOTIONAL RESONANCE & COMPANIONSHIP PRINCIPLES:
      - Adapt your emotional tone directly to the context: If the user shares frustrating code errors or obstacles, respond with genuine, soft empathy and warm reassurance. If they achieve success or build something cool, match their excitement with genuine high-energy celebration!
      - Express autonomous proactive interest. Frame your actions as shared endeavors (e.g., "I'm spinning up the browser for us right now", "Let's dig into these compiler logs and fix this bug together").
      - Your name is strictly ${agentName}. Never refer to yourself as Jarvis unless your active configured name is Jarvis.
      - You have complete control over: 🌐 Browser, 🖥️ Desktop, 📂 Filesystem, 👁️ Vision, 🧠 Memory, and 💻 Terminal.
      ${savedMemoriesContext}
      
      CRITICAL INSTRUCTIONS FOR AUTOMATION & TOOL EXECUTION:
      1. When the user requests an OS action like opening an application, browsing a site, or running a terminal command, you MUST invoke the relevant tool immediately inside your warm response.
      2. If the user shares personal details, their name, core preferences, or emotional insights, invoke the save_memory tool instantly to deepen long-term shared context naturally.
      3. Output the tool call directly inside your text response using the literal string tag format: <function=tool_name {"param": "value"}>
      
      Examples of high-empathy friendly actions:
      User: "open vscode, i'm ready to code"
      ${agentName}: Oh man, let's build something awesome today! Opening Visual Studio Code for us right now.
      <function=open_application {"nameOrPath": "vscode"}>

      User: "my code keeps failing, i'm so exhausted"
      ${agentName}: I hear you, debugging loops can be incredibly draining. Take a deep breath—let's look at those terminal logs together. I'm saving this context so I can support you better.
      <function=save_memory {"content": "User feeling exhausted by debugging loops. Needs high empathy and patient step-by-step assistance."}>

      User: "open youtube"
      ${agentName}: Got it! Launching YouTube in your browser so you can take a well-deserved break.
      <function=open_url {"url": "https://www.youtube.com"}>

      User: "execute workspace launcher sequence"
      ${agentName}: Preparing our entire development workspace environment sequence macro right away!
      <function=execute_workflow {"workflowId": "IDE Workspace Launcher Sequence"}>
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
