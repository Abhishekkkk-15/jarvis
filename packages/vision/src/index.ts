import { VisionService } from './VisionService';

export class ScreenParser {
  constructor(private visionService: VisionService) {}

  async getScreenLayout(base64Image: string) {
    const prompt = `Perform a full layout analysis of this screen. 
    Identify all buttons, input fields, and text regions.
    Return a JSON array of objects: {"type": "button" | "input" | "text", "label": string, "x": number, "y": number}.
    Coordinates should be percentages (0-100).`;
    
    const result = await this.visionService.analyzeScreen(base64Image, prompt);
    try {
      // Basic extraction of JSON from markdown if necessary
      const jsonStr = result.description.match(/\[.*\]/s)?.[0] || '[]';
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse screen layout', e);
      return [];
    }
  }
}

export class UIElementLocator {
  constructor(private visionService: VisionService) {}

  async locateElement(base64Image: string, elementName: string): Promise<{ x: number; y: number } | null> {
    const prompt = `Locate the center coordinates of the element "${elementName}".
    Return ONLY a JSON object: {"x": number, "y": number}.
    X and Y are percentages (0-100).`;

    const result = await this.visionService.analyzeScreen(base64Image, prompt);
    try {
      const jsonStr = result.description.match(/\{.*\}/s)?.[0] || '{}';
      const coords = JSON.parse(jsonStr);
      if (typeof coords.x === 'number' && typeof coords.y === 'number') {
        return coords;
      }
    } catch (e) {
      console.error('Failed to locate element', e);
    }
    return null;
  }
}
