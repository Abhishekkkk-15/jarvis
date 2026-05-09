import { z } from 'zod';
import { ToolDefinition } from '../index';

export const databaseTools: ToolDefinition[] = [
  {
    name: 'query_database',
    description: 'Executes a raw SQL query against the system database (Requires Approval)',
    parameters: z.object({ sql: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'inspect_schema',
    description: 'Returns the schema structure of the system database',
    parameters: z.object({}),
    execute: async () => ({}),
  }
];
