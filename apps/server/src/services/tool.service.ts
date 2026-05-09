import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ToolRegistry, openBrowserTool, searchFilesTool } from '@jarvis/tools';
import { chromium, Browser, Page } from 'playwright';
import { DesktopService } from './desktop.service';
import { FileService } from './file.service';

@Injectable()
export class ToolService {
  private registry: ToolRegistry;
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(
    private readonly desktopService: DesktopService,
    private readonly fileService: FileService,
  ) {
    this.registry = new ToolRegistry();
    this.setupTools();
  }

  private setupTools() {
    // Browser Tool
    const browserTool = { ...openBrowserTool };
    browserTool.execute = async ({ url }) => this.openBrowser(url);

    // File Tool
    const searchTool = { ...searchFilesTool };
    searchTool.execute = async ({ query }) => this.fileService.searchFiles(query);

    this.registry.register(browserTool);
    this.registry.register(searchTool);

    // Add Desktop Tools
    this.registry.register({
      name: 'click_desktop',
      description: 'Clicks the current mouse position',
      parameters: z.object({ button: z.enum(['left', 'right']).optional() }) as any,
      execute: async ({ button }) => {
        await this.desktopService.click(button);
        return { success: true };
      },
    });

    this.registry.register({
      name: 'type_text',
      description: 'Types text using the keyboard',
      parameters: z.object({ text: z.string() }) as any,
      execute: async ({ text }) => {
        await this.desktopService.type(text);
        return { success: true };
      },
    });
  }

  async executeTool(name: string, args: any) {
    const tool = this.registry.getTool(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    
    console.log(`Executing tool: ${name} with args:`, args);
    return tool.execute(args);
  }

  private async openBrowser(url: string) {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: false });
    }
    this.page = await this.browser.newPage();
    await this.page.goto(url);
    return { success: true, message: `Opened ${url}` };
  }

  private async searchFiles(query: string) {
    // In a real app, this would use a local indexing service
    return { success: true, results: [`Found example result for ${query}`] };
  }

  getRegistry() {
    return this.registry;
  }
}
