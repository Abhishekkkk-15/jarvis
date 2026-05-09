import { z } from 'zod';
import { ToolDefinition } from '../index';

export const workflowTools: ToolDefinition[] = [
  {
    name: 'create_workflow',
    description: 'Defines a new multi-step automation workflow',
    parameters: z.object({ name: z.string(), steps: z.array(z.any()) }),
    execute: async () => ({}),
  },
  {
    name: 'execute_workflow',
    description: 'Triggers the execution of a saved workflow',
    parameters: z.object({ workflowId: z.string(), inputs: z.record(z.any()).optional() }),
    execute: async () => ({}),
  }
];
