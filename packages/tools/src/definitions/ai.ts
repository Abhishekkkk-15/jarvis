import { z } from 'zod';
import { ToolDefinition } from '../index';

export const aiTools: ToolDefinition[] = [
  {
    name: 'generate_code',
    description: 'Generates a code snippet based on a description',
    parameters: z.object({ description: z.string(), language: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'analyze_logs',
    description: 'Analyzes a log file to find errors or patterns',
    parameters: z.object({ logContent: z.string() }),
    execute: async () => ({}),
  }
];
