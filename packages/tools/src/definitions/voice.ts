import { z } from 'zod';
import { ToolDefinition } from '../index';

export const voiceTools: ToolDefinition[] = [
  {
    name: 'speak_text',
    description: 'ONLY use this when the user explicitly asks you to "say" or "speak" something out loud. DO NOT use this for normal chat responses or greetings.',
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
