import { z } from 'zod';
import { ToolDefinition } from '../index';

export const voiceTools: ToolDefinition[] = [
  {
    name: 'speak_text',
    description: 'Converts text to speech and plays it through the speakers',
    parameters: z.object({ text: z.string(), voice: z.string().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'start_listening',
    description: 'Enables continuous voice recognition mode',
    parameters: z.object({}),
    execute: async () => ({}),
  }
];
