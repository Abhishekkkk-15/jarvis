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
      $speak.GetInstalledVoices() | Select-Object -ExpandProperty VoiceInfo | Select-Object Name, Gender, Age | ConvertTo-Json
    `.replace(/\n/g, ' ');
    
    const result = await this.terminalService.executePowerShell(command);
    try {
      const rawVoices = JSON.parse(result.stdout);
      const voices = Array.isArray(rawVoices) ? rawVoices : [rawVoices];
      
      // Map system voices to Jarvis Personas
      const mappedVoices = voices.map(v => ({
        id: v.Name,
        name: v.Name.includes('David') ? 'The Butler' : 
              v.Name.includes('Zira') ? 'The Analyst' : 
              v.Name.includes('Hazel') ? 'The Executive' : v.Name,
        style: v.Gender === 1 ? 'Masculine / Authoritative' : 'Feminine / Precise',
        age: v.Age === 1 ? 'Mature' : 'Adult'
      }));

      if (process.env.NVIDIA_API_KEY) {
        mappedVoices.unshift({
          id: 'nvidia-nim',
          name: 'NVIDIA Jarvis (Premium)',
          style: 'Studio Quality / Zero-Shot',
          age: 'Adult'
        });
      }

      return mappedVoices;
    } catch {
      const fallbacks = [
        { id: 'Microsoft David', name: 'The Butler', style: 'Masculine / Formal', age: 'Mature' },
        { id: 'Microsoft Zira', name: 'The Analyst', style: 'Feminine / Precise', age: 'Adult' }
      ];
      
      if (process.env.NVIDIA_API_KEY) {
        fallbacks.unshift({
          id: 'nvidia-nim',
          name: 'NVIDIA Jarvis (Premium)',
          style: 'Studio Quality / Zero-Shot',
          age: 'Adult'
        });
      }
      return fallbacks;
    }
  }
}
