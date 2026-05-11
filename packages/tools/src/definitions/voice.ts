import { z } from 'zod';
import { ToolDefinition } from '../index';

export const voiceTools: ToolDefinition[] = [
  {
    name: 'start_listening',
    description: 'Enables continuous voice recognition mode',
    parameters: z.object({}),
    execute: async () => ({}),
  }
];
