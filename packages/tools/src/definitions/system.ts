import { z } from 'zod';
import { ToolDefinition } from '../index';

export const systemTools: ToolDefinition[] = [
  {
    name: 'get_system_info',
    description: 'Returns information about the operating system and hardware',
    parameters: z.object({}),
    execute: async () => ({}),
  },
  {
    name: 'clipboard_read',
    description: 'Reads the current text from the system clipboard',
    parameters: z.object({}),
    execute: async () => ({}),
  },
  {
    name: 'clipboard_write',
    description: 'Writes text to the system clipboard',
    parameters: z.object({ text: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'notification_send',
    description: 'Sends a system notification',
    parameters: z.object({ 
      title: z.string(), 
      message: z.string(),
      priority: z.enum(['low', 'normal', 'high']).optional()
    }),
    execute: async () => ({}),
  },
  {
    name: 'volume_control',
    description: 'Controls the system volume',
    parameters: z.object({ level: z.number().min(0).max(100), mute: z.boolean().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'brightness_control',
    description: 'Controls the screen brightness',
    parameters: z.object({ level: z.number().min(0).max(100) }),
    execute: async () => ({}),
  },
  {
    name: 'shutdown_system',
    description: 'Shuts down the computer (Requires Approval)',
    parameters: z.object({ force: z.boolean().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'open_application',
    description: 'Opens a system application, executable, or software program by name or absolute path',
    parameters: z.object({ nameOrPath: z.string() }),
    execute: async () => ({}),
  }
];
