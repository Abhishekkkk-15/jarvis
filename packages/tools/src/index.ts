import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: any) => Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
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

// Example Tool: Open Browser
export const openBrowserTool: ToolDefinition = {
  name: 'open_browser',
  description: 'Opens a new browser window to a specific URL',
  parameters: z.object({
    url: z.string().url().describe('The URL to open'),
  }),
  execute: async ({ url }) => {
    // This will be implemented in the Desktop/Server layer
    return { success: true, message: `Opening browser to ${url}` };
  },
};

// Example Tool: Search Files
export const searchFilesTool: ToolDefinition = {
  name: 'search_files',
  description: 'Searches for files in the local filesystem',
  parameters: z.object({
    query: z.string().describe('The search query'),
    path: z.string().optional().describe('Optional directory to search in'),
  }),
  execute: async ({ query, path }) => {
    return { success: true, results: [] };
  },
};
