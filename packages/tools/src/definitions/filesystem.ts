import { z } from 'zod';
import { ToolDefinition } from '../index';

export const filesystemTools: ToolDefinition[] = [
  {
    name: 'list_directory',
    description: 'Lists files and folders in a directory',
    parameters: z.object({ path: z.string().describe('Absolute path to the directory') }),
    execute: async () => ({}),
  },
  {
    name: 'read_file',
    description: 'Reads the contents of a file',
    parameters: z.object({ path: z.string().describe('Absolute path to the file') }),
    execute: async () => ({}),
  },
  {
    name: 'write_file',
    description: 'Creates or overwrites a file with new content (Requires Approval)',
    parameters: z.object({ 
      path: z.string(), 
      content: z.string() 
    }),
    execute: async () => ({}),
  },
  {
    name: 'delete_file',
    description: 'Deletes a file (Requires Approval)',
    parameters: z.object({ path: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'search_files',
    description: 'Searches for files matching a pattern',
    parameters: z.object({ 
      query: z.string(), 
      root: z.string().optional() 
    }),
    execute: async () => ({}),
  },
  {
    name: 'move_file',
    description: 'Moves a file from one location to another',
    parameters: z.object({ source: z.string(), destination: z.string() }),
    execute: async () => ({}),
  }
];
