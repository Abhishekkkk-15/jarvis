import { z } from 'zod';
import { ToolDefinition } from '../index';

export const memoryTools: ToolDefinition[] = [
  {
    name: 'save_memory',
    description: 'Saves a piece of information for long-term recall',
    parameters: z.object({ content: z.string(), tags: z.array(z.string()).optional() }),
    execute: async () => ({}),
  },
  {
    name: 'search_memory',
    description: 'Searches for previously saved information',
    parameters: z.object({ query: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'save_user_preference',
    description: 'Updates a specific user setting or preference',
    parameters: z.object({ key: z.string(), value: z.any() }),
    execute: async () => ({}),
  }
];
