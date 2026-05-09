import { z } from 'zod';
import { ToolDefinition } from '../index';

export const communicationTools: ToolDefinition[] = [
  {
    name: 'send_email',
    description: 'Sends an email to a recipient',
    parameters: z.object({ to: z.string().email(), subject: z.string(), body: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'send_discord_message',
    description: 'Sends a message to a Discord channel or user',
    parameters: z.object({ channelId: z.string(), content: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'send_slack_message',
    description: 'Sends a message to a Slack channel or user',
    parameters: z.object({ channelId: z.string(), content: z.string() }),
    execute: async () => ({}),
  }
];
