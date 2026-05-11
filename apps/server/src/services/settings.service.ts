import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { settings } from '@jarvis/database';
import { eq } from 'drizzle-orm';

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
      voiceId: 'groq-autumn',
      rate: 0,
      pitch: 0,
      autoSpeak: false,
      volume: 100,
    },
    theme: 'calm',
  };

  constructor(private readonly db: DatabaseService) {}

  async getSettings(): Promise<UserSettings> {
    const dbSettings = await this.db.db.select().from(settings);
    
    // Convert array of {key, value} to an object
    const settingsObj = dbSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as any);

    return {
      ...this.defaultSettings,
      ...settingsObj,
      voice: {
        ...this.defaultSettings.voice,
        ...(settingsObj.voice || {}),
      },
    };
  }

  async updateVoiceSettings(voice: Partial<VoiceSettings>): Promise<VoiceSettings> {
    const current = await this.getSettings();
    const updatedVoice = { ...current.voice, ...voice };
    
    await this.db.db.insert(settings)
      .values({
        key: 'voice',
        value: updatedVoice,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: updatedVoice, updatedAt: new Date() },
      });

    return updatedVoice;
  }

  async updateSetting(key: string, value: any): Promise<void> {
    await this.db.db.insert(settings)
      .values({
        key,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
}
