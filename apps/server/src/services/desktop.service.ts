import { Injectable } from '@nestjs/common';
import { mouse, keyboard, Button, Key, screen } from '@nut-tree-fork/nut-js';

@Injectable()
export class DesktopService {
  async moveMouse(x: number, y: number) {
    await mouse.setPosition({ x, y });
  }

  async click(button: 'left' | 'right' = 'left') {
    const b = button === 'left' ? Button.LEFT : Button.RIGHT;
    await mouse.click(b);
  }

  async type(text: string) {
    await keyboard.type(text);
  }

  async pressKey(key: string) {
    // Basic mapping, needs expansion
    await keyboard.pressKey(Key.Enter);
  }

  async screenshot(filePath: string) {
    return screen.capture(filePath);
  }

  async takeScreenshot() {
    return screen.capture('screenshot.png');
  }
}
