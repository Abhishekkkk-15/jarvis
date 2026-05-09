import { Injectable } from '@nestjs/common';
import { AIService } from './ai.service';
import { TerminalService } from './terminal.service';

@Injectable()
export class VoiceService {
  constructor(
    private readonly aiService: AIService,
    private readonly terminalService: TerminalService,
  ) {}

  async getVoices() {
    const command = `
      Add-Type -AssemblyName System.Speech;
      $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
      $speak.GetInstalledVoices() | Select-Object -ExpandProperty VoiceInfo | Select-Object Name | ConvertTo-Json
    `.replace(/\n/g, ' ');
    
    const result = await this.terminalService.executePowerShell(command);
    try {
      const data = JSON.parse(result.stdout);
      return Array.isArray(data) ? data.map(v => v.Name) : [data.Name];
    } catch {
      return ['Microsoft David', 'Microsoft Zira'];
    }
  }
}
