import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TerminalService } from './terminal.service';
import { VoiceService, Persona } from './voice.service';
import { createGroqTtsProvider, createNvidiaTtsProvider } from '@jarvis/ai';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TtsService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly terminalService: TerminalService,
    @Inject(forwardRef(() => VoiceService))
    private readonly voiceService: VoiceService,
  ) {}

  async speak(text: string) {
    const settings = await this.settingsService.getSettings();
    const v = settings.voice;
    const groqKey = process.env.GROQ_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    // 1. Try Groq Premium TTS (High Performance) - Selected or Default
    if (groqKey && (v.voiceId.startsWith('groq-') || v.voiceId === 'nvidia-nim')) {
      try {
        const voices = await this.voiceService.getVoices();
        const persona = voices.find((p: Persona) => p.id === v.voiceId);
        const voiceName = persona?.voice || 'autumn';
        
        const tts = createGroqTtsProvider(groqKey, 'canopylabs/orpheus-v1-english', voiceName);
        const audioBuffer = await tts.generateSpeech(text);
        console.log(`[TTS] Groq Audio: ${audioBuffer.length} bytes`);

        const audioBase64 = audioBuffer.toString('base64');
        return { success: true, provider: 'groq', audioBase64 };
      } catch (error: any) {
        console.warn('Groq TTS failed, falling back:', error.message);
      }
    }

    // 2. Try NVIDIA Premium TTS if configured and Groq failed/not used
    if (nvidiaKey && v.voiceId === 'nvidia-nim') {
      try {
        const tts = createNvidiaTtsProvider(nvidiaKey);
        const audioBuffer = await tts.generateSpeech(text);

        const audioBase64 = audioBuffer.toString('base64');
        return { success: true, provider: 'nvidia', audioBase64 };
      } catch (error: any) {
        if (!error.message.includes('404')) {
          console.warn('NVIDIA TTS failed:', error.message);
        }
      }
    }

    // 3. Fallback to Windows System Speech (SAPI)
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
