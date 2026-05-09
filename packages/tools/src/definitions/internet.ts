import { z } from 'zod';
import { ToolDefinition } from '../index';

export const internetTools: ToolDefinition[] = [
  {
    name: 'web_search',
    description: 'Searches the web for information using a search engine',
    parameters: z.object({ query: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'fetch_url',
    description: 'Downloads the raw content of a URL',
    parameters: z.object({ url: z.string().url() }),
    execute: async () => ({}),
  },
  {
    name: 'search_news',
    description: 'Searches for recent news articles on a topic',
    parameters: z.object({ query: z.string() }),
    execute: async () => ({}),
  }
];
