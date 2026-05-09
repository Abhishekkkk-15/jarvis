import { chromium, Browser, Page } from 'playwright';

export class DOMAnalyzer {
  static async getSimplifiedDOM(page: Page) {
    return await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input, [role="button"], h1, h2, h3');
      return Array.from(elements).map((el, i) => ({
        id: i,
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        type: (el as any).type,
        placeholder: (el as any).placeholder,
        role: el.getAttribute('role'),
      }));
    });
  }
}

export class BrowserAgent {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async start() {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
  }

  async navigate(url: string) {
    if (!this.page) throw new Error('Browser not started');
    await this.page.goto(url);
  }

  async click(selector: string) {
    if (!this.page) throw new Error('Browser not started');
    await this.page.click(selector);
  }

  async type(selector: string, text: string) {
    if (!this.page) throw new Error('Browser not started');
    await this.page.fill(selector, text);
  }

  async getContext() {
    if (!this.page) return null;
    const dom = await DOMAnalyzer.getSimplifiedDOM(this.page);
    const title = await this.page.title();
    const url = this.page.url();
    return { title, url, dom };
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}
