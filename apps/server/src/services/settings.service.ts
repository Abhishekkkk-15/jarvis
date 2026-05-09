import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface VoiceSettings {
  voiceId: string;
  rate: number;
  pitch: number;
  autoSpeak: boolean;
  volume: number;
}

export interface UserSettings {
  voice: VoiceSettings;
  theme: string;
}

@Injectable()
export class SettingsService {
  private readonly defaultSettings: UserSettings = {
    voice: {
      voiceId: 'Microsoft David',
      rate: 0,
      pitch: 0,
      autoSpeak: false,
      volume: 100,
    },
    theme: 'calm',
  };

  constructor(private readonly db: DatabaseService) {}

  async getSettings(): Promise<UserSettings> {
    // In a real app, fetch from DB. For now, use in-memory with default fallback.
    return this.defaultSettings;
  }

  async updateVoiceSettings(voice: Partial<VoiceSettings>): Promise<VoiceSettings> {
    const current = await this.getSettings();
    Object.assign(current.voice, voice);
    // Persist to DB here
    return current.voice;
  }
}
