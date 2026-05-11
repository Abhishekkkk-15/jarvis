import { Injectable } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TerminalService } from './terminal.service';
import { createNvidiaTtsProvider } from '@jarvis/ai';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TtsService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly terminalService: TerminalService,
  ) {}

  async speak(text: string) {
    const settings = await this.settingsService.getSettings();
    const v = settings.voice;
    const apiKey = process.env.NVIDIA_API_KEY;

    // 1. Try NVIDIA Premium TTS if configured and selected
    if (apiKey && v.voiceId === 'nvidia-nim') {
      try {
        const tts = createNvidiaTtsProvider(apiKey);
        const audioBuffer = await tts.generateSpeech(text);

        const tempDir = path.join(process.cwd(), 'temp', 'audio');
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `voice_${Date.now()}.wav`);
        await fs.writeFile(tempPath, audioBuffer);

        // Play the generated WAV file
        const playCommand = `
          $player = New-Object System.Media.SoundPlayer "${tempPath}";
          $player.PlaySync();
        `.replace(/\n/g, ' ');

        await this.terminalService.executePowerShell(playCommand);
        
        // Cleanup
        setTimeout(() => fs.unlink(tempPath).catch(() => {}), 10000);
        return { success: true, provider: 'nvidia' };
      } catch (error: any) {
        if (!error.message.includes('404')) {
          console.warn('NVIDIA TTS failed:', error.message);
        }
        // Fall through to system speech
      }
    }

    // 2. Fallback to Windows System Speech (SAPI)
    // We use a more robust PowerShell script that handles rate and volume correctly
    const systemCommand = `
      Add-Type -AssemblyName System.Speech;
      $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
      $speak.Rate = ${v.rate};
      $speak.Volume = ${v.volume};
      try { 
        $voice = $speak.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Name -like "*${v.voiceId}*" } | Select-Object -First 1;
        if ($voice) { $speak.SelectVoice($voice.VoiceInfo.Name); }
      } catch {}
      $speak.Speak("${text.replace(/"/g, '`"').replace(/\n/g, ' ')}");
    `.replace(/\n/g, ' ');

    try {
      await this.terminalService.executePowerShell(systemCommand);
      return { success: true, provider: 'system' };
    } catch (error: any) {
      console.error('System Speech Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}
