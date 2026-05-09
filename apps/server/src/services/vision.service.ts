import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { AIService } from './ai.service';
import { HumanMessage } from '@langchain/core/messages';
import * as fs from 'fs/promises';

@Injectable()
export class VisionService {
  constructor(
    @Inject(forwardRef(() => AIService))
    private readonly aiService: AIService,
  ) {}

  async analyzeImage(imagePath: string, prompt: string = 'What is on this screen?') {
    const provider = await this.aiService.getProvider();
    const model = provider.getModel();

    const imageData = await fs.readFile(imagePath, { encoding: 'base64' });
    
    const message = new HumanMessage({
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageData}` },
        },
      ],
    });

    const response = await model.invoke([message]);
    return response.content;
  }
}
