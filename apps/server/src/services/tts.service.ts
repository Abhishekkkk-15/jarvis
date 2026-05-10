import { Injectable } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TerminalService } from './terminal.service';
import { createNvidiaTtsProvider } from '@jarvis/ai';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

@Injectable()
export class TtsService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly terminalService: TerminalService,
  ) {}

  async speak(text: string) {
    try {
      const settings = await this.settingsService.getSettings();
      const apiKey = process.env.NVIDIA_API_KEY;

      if (!apiKey) {
        throw new Error('NVIDIA_API_KEY not found');
      }

      const tts = createNvidiaTtsProvider(apiKey);
      const audioBuffer = await tts.generateSpeech(text);

      const tempDir = path.join(process.cwd(), 'temp', 'audio');
      await fs.mkdir(tempDir, { recursive: true });
      const tempPath = path.join(tempDir, `voice_${Date.now()}.wav`);
      await fs.writeFile(tempPath, audioBuffer);

      // Play via PowerShell
      // We use PlaySync to wait for completion, or Play to return immediately
      const command = `
        $player = New-Object System.Media.SoundPlayer "${tempPath}";
        $player.PlaySync();
      `.replace(/\n/g, ' ');

      await this.terminalService.executePowerShell(command);
      
      // Cleanup after a delay
      setTimeout(() => fs.unlink(tempPath).catch(() => {}), 30000);
      
      return { success: true };
    } catch (error: any) {
      console.error('TtsService Error:', error.message);
      throw error;
    }
  }
}
