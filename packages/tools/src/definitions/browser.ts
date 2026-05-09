import { z } from 'zod';
import { ToolDefinition } from '../index';

export const browserTools: ToolDefinition[] = [
  {
    name: 'open_url',
    description: 'Navigates the browser to a specific URL',
    parameters: z.object({ url: z.string().url() }),
    execute: async () => ({}),
  },
  {
    name: 'click_element',
    description: 'Clicks an element on the page using a CSS selector or text',
    parameters: z.object({ selector: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'type_into_field',
    description: 'Types text into an input field',
    parameters: z.object({ selector: z.string(), text: z.string() }),
    execute: async () => ({}),
  },
  {
    name: 'extract_page_text',
    description: 'Returns the visible text content of the current page',
    parameters: z.object({}),
    execute: async () => ({}),
  },
  {
    name: 'take_screenshot',
    description: 'Takes a screenshot of the current browser page',
    parameters: z.object({ fullPage: z.boolean().optional().default(false) }),
    execute: async () => ({}),
  },
  {
    name: 'inspect_dom',
    description: 'Returns the DOM structure or a specific element tree',
    parameters: z.object({ selector: z.string().optional() }),
    execute: async () => ({}),
  }
];
