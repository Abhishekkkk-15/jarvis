import axios from 'axios';

export interface VisionResult {
  description: string;
  elements?: { label: string; x: number; y: number }[];
}

export class VisionService {
  constructor(private apiKey: string, private provider: 'groq' | 'nvidia' = 'groq') {}

  async analyzeScreen(base64Image: string, prompt = 'Describe this screen and list all clickable elements with their approximate coordinates if possible.'): Promise<VisionResult> {
    const url = this.provider === 'groq' 
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://integrate.api.nvidia.com/v1/chat/completions';

    const model = this.provider === 'groq'
      ? 'llama-3.2-11b-vision-preview'
      : 'nvidia/llama-3.2-nv-embedqc-7b-v1'; // Placeholder, should be a vision model like 'meta/llama-3.2-11b-vision-instruct'

    const response = await axios.post(url, {
      model: this.provider === 'groq' ? 'llama-3.2-11b-vision-preview' : 'meta/llama-3.2-11b-vision-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      description: response.data.choices[0].message.content,
    };
  }
}
