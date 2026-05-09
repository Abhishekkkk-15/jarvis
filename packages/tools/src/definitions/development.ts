import { z } from 'zod';
import { ToolDefinition } from '../index';

export const developmentTools: ToolDefinition[] = [
  {
    name: 'git_status',
    description: 'Returns the current git status of a repository',
    parameters: z.object({ path: z.string().optional() }),
    execute: async () => ({}),
  },
  {
    name: 'git_commit',
    description: 'Commits changes with a message (Requires Approval)',
    parameters: z.object({ path: z.string().optional(), message: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'run_tests',
    description: 'Runs the test suite for the current project',
    parameters: z.object({ command: z.string().optional().default('npm test') }),
    execute: async () => ({}),
  },
  {
    name: 'search_codebase',
    description: 'Searches for symbols or text across the entire codebase',
    parameters: z.object({ query: z.string() }),
    execute: async () => ({}),
  }
];
