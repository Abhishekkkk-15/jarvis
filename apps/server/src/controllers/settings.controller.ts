import { Controller, Get, Post, Body } from '@nestjs/common';

import { SettingsService, VoiceSettings } from '../services/settings.service';
import { VoiceService } from '../services/voice.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly voiceService: VoiceService
  ) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('voices')
  async getVoices() {
    return this.voiceService.getVoices();
  }

  @Post('voice')
  async updateVoice(@Body() data: Partial<VoiceSettings>) {
    return this.settingsService.updateVoiceSettings(data);
  }
}
