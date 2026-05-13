import { Injectable } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { createGroqSttProvider } from '@jarvis/ai';

@Injectable()
export class SttService {
  constructor(private readonly settingsService: SettingsService) {}

  async transcribeAudio(audioBuffer: Buffer, filename = 'audio.wav'): Promise<string> {
    const settings = await this.settingsService.getSettings();
    const groqKey = (settings as any).GROQ_API_KEY || process.env.GROQ_API_KEY;

    if (!groqKey) {
      throw new Error('Groq API Key is not configured for Whisper STT transcription.');
    }

    const stt = createGroqSttProvider(groqKey, 'whisper-large-v3');
    return await stt.transcribeAudio(audioBuffer, filename);
  }
}
