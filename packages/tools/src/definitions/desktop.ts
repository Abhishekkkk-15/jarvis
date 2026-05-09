import { z } from 'zod';
import { ToolDefinition } from '../index';

export const desktopTools: ToolDefinition[] = [
  {
    name: 'move_mouse',
    description: 'Moves the mouse to specific coordinates',
    parameters: z.object({ x: z.number(), y: z.number() }),
    execute: async () => ({}),
  },
  {
    name: 'mouse_click',
    description: 'Performs a mouse click (Requires Approval for certain apps)',
    parameters: z.object({ 
      button: z.enum(['left', 'right', 'middle']).optional().default('left'),
      double: z.boolean().optional().default(false)
    }),
    execute: async () => ({}),
  },
  {
    name: 'keyboard_type',
    description: 'Types text into the active window (Requires Approval)',
    parameters: z.object({ text: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'keyboard_hotkey',
    description: 'Presses a combination of keys (e.g., ctrl+c)',
    parameters: z.object({ keys: z.array(z.string()) }),
    execute: async () => ({}),
  },
  {
    name: 'take_desktop_screenshot',
    description: 'Takes a screenshot of the entire desktop',
    parameters: z.object({}),
    execute: async () => ({}),
  }
];
