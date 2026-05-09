import { z } from 'zod';
import { ToolDefinition } from '../index';

export const agenticTools: ToolDefinition[] = [
  {
    name: 'create_subtask',
    description: 'Breaks down a complex goal into smaller, manageable subtasks',
    parameters: z.object({ goal: z.string(), parentTaskId: z.string().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'evaluate_task_result',
    description: 'Critically analyzes the output of a tool or subtask for correctness',
    parameters: z.object({ result: z.any(), expectedOutcome: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'update_execution_plan',
    description: 'Modifies the current task plan based on new information or failures',
    parameters: z.object({ reason: z.string(), newSteps: z.array(z.string()) }),
    execute: async () => ({}),
  }
];
