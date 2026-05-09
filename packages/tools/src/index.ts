import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { systemTools } from './definitions/system';
import { filesystemTools } from './definitions/filesystem';
import { terminalTools } from './definitions/terminal';
import { browserTools } from './definitions/browser';
import { desktopTools } from './definitions/desktop';
import { visionTools } from './definitions/vision';
import { memoryTools } from './definitions/memory';
import { aiTools } from './definitions/ai';
import { communicationTools } from './definitions/communication';
import { developmentTools } from './definitions/development';
import { workflowTools } from './definitions/workflow';
import { voiceTools } from './definitions/voice';
import { internetTools } from './definitions/internet';
import { databaseTools } from './definitions/database';
import { agenticTools } from './definitions/agentic';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: any) => Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerCategory(systemTools);
    this.registerCategory(filesystemTools);
    this.registerCategory(terminalTools);
    this.registerCategory(browserTools);
    this.registerCategory(desktopTools);
    this.registerCategory(visionTools);
    this.registerCategory(memoryTools);
    this.registerCategory(aiTools);
    this.registerCategory(communicationTools);
    this.registerCategory(developmentTools);
    this.registerCategory(workflowTools);
    this.registerCategory(voiceTools);
    this.registerCategory(internetTools);
    this.registerCategory(databaseTools);
    this.registerCategory(agenticTools);
  }

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  registerCategory(tools: ToolDefinition[]) {
    tools.forEach(tool => this.register(tool));
  }

  getTool(name: string) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getJsonSchemas() {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters as any),
    }));
  }
}

// Keep legacy exports for compatibility during transition
export const openBrowserTool = browserTools.find(t => t.name === 'open_url')!;
export const searchFilesTool = filesystemTools.find(t => t.name === 'search_files')!;
