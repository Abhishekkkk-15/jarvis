import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { AIService } from './ai.service';
import { TerminalService } from './terminal.service';

export interface Persona {
  id: string;
  name: string;
  style: string;
  age: string;
  voice?: string;
}

@Injectable()
export class VoiceService {
  constructor(
    @Inject(forwardRef(() => AIService))
    private readonly aiService: AIService,
    private readonly terminalService: TerminalService,
  ) {}

  async getVoices(): Promise<Persona[]> {
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

      if (process.env.GROQ_API_KEY) {
        const groqVoices = [
          { id: 'groq-autumn-v1', name: 'The Storyteller (Groq)', style: 'Elegant & Soft', age: 'Adult', voice: 'autumn' },
          { id: 'groq-diana-v1', name: 'The Virtual Guide (Groq)', style: 'Helpful & Clear', age: 'Adult', voice: 'diana' },
          { id: 'groq-hannah-v1', name: 'The Professional (Groq)', style: 'Corporate & Sharp', age: 'Adult', voice: 'hannah' },
          { id: 'groq-autumn-v2', name: 'The Librarian (Groq)', style: 'Sophisticated & Calm', age: 'Mature', voice: 'autumn' },
          { id: 'groq-diana-v2', name: 'The Research Assistant (Groq)', style: 'Analytical & Precise', age: 'Adult', voice: 'diana' },
          { id: 'groq-austin', name: 'The Strategist (Groq)', style: 'Deep & Resonant', age: 'Adult', voice: 'austin' },
          { id: 'groq-daniel', name: 'The Guardian (Groq)', style: 'Warm & Authoritative', age: 'Adult', voice: 'daniel' },
          { id: 'groq-troy', name: 'The Commander (Groq)', style: 'Bold & Energetic', age: 'Adult', voice: 'troy' },
        ];
        mappedVoices.unshift(...groqVoices);
      }

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
      
      if (process.env.GROQ_API_KEY) {
        const groqVoices = [
          { id: 'groq-autumn-v1', name: 'The Storyteller (Groq)', style: 'Elegant & Soft', age: 'Adult', voice: 'autumn' },
          { id: 'groq-diana-v1', name: 'The Virtual Guide (Groq)', style: 'Helpful & Clear', age: 'Adult', voice: 'diana' },
          { id: 'groq-hannah-v1', name: 'The Professional (Groq)', style: 'Corporate & Sharp', age: 'Adult', voice: 'hannah' },
          { id: 'groq-autumn-v2', name: 'The Librarian (Groq)', style: 'Sophisticated & Calm', age: 'Mature', voice: 'autumn' },
          { id: 'groq-diana-v2', name: 'The Research Assistant (Groq)', style: 'Analytical & Precise', age: 'Adult', voice: 'diana' },
          { id: 'groq-austin', name: 'The Strategist (Groq)', style: 'Deep & Resonant', age: 'Adult', voice: 'austin' },
          { id: 'groq-daniel', name: 'The Guardian (Groq)', style: 'Warm / Authoritative', age: 'Adult', voice: 'daniel' },
          { id: 'groq-troy', name: 'The Commander (Groq)', style: 'Bold / Energetic', age: 'Adult', voice: 'troy' },
        ];
        fallbacks.unshift(...groqVoices);
      }

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
