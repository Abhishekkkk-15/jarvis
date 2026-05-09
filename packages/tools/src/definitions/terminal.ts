import { z } from 'zod';
import { ToolDefinition } from '../index';

export const terminalTools: ToolDefinition[] = [
  {
    name: 'execute_shell',
    description: 'Executes a command in the system shell (bash/zsh) (Requires Approval)',
    parameters: z.object({ 
      command: z.string(),
      cwd: z.string().optional(),
      timeout: z.number().optional().default(30000)
    }),
    execute: async () => ({}),
  },
  {
    name: 'execute_powershell',
    description: 'Executes a command in PowerShell (Requires Approval)',
    parameters: z.object({ 
      command: z.string(),
      cwd: z.string().optional(),
      timeout: z.number().optional().default(30000)
    }),
    execute: async () => ({}),
  }
];
