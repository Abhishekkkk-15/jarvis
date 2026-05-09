import { z } from 'zod';
import { ToolDefinition } from '../index';

export const visionTools: ToolDefinition[] = [
  {
    name: 'analyze_screenshot',
    description: 'Uses AI to describe what is happening on the screen',
    parameters: z.object({ screenshotPath: z.string().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'ocr_extract_text',
    description: 'Extracts text from a specific region of the screen or an image',
    parameters: z.object({ x: z.number().optional(), y: z.number().optional(), width: z.number().optional(), height: z.number().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'detect_ui_elements',
    description: 'Identifies buttons, fields, and windows on the current screen',
    parameters: z.object({}),
    execute: async () => ({}),
  }
];
