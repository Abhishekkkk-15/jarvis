import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Embeddings } from '@langchain/core/embeddings';

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  embeddingModel?: string;
}

export interface TtsConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  voice?: string;
  audioPrompt?: string;
}

class MockEmbeddings extends Embeddings {
  constructor() {
    super({});
  }
  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map(() => new Array(1536).fill(0));
  }
  async embedQuery(text: string): Promise<number[]> {
    return new Array(1536).fill(0);
  }
}

export class AIProvider {
  private model: BaseChatModel;
  private embeddings: Embeddings;
  public readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.model = new ChatOpenAI({
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl,
      },
      modelName: config.model,
      temperature: config.temperature ?? 0.7,
      streaming: true,
    });

    if (config.embeddingModel) {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.apiKey,
        configuration: {
          baseURL: config.baseUrl,
        },
        modelName: config.embeddingModel,
      });
    } else if (config.baseUrl?.includes('groq')) {
      // Groq doesn't have a standard embedding endpoint yet
      this.embeddings = new MockEmbeddings();
    } else {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.apiKey,
        configuration: {
          baseURL: config.baseUrl,
        },
        modelName: 'text-embedding-3-small',
      });
    }
  }

  getModel() {
    return this.model;
  }

  getEmbeddings() {
    return this.embeddings;
  }
}

export const createGroqProvider = (apiKey: string, model = 'llama-3.3-70b-versatile') => {
  return new AIProvider({
    apiKey,
    baseUrl: 'https://api.groq.com/openai/v1',
    model,
  });
};

export const createNvidiaProvider = (apiKey: string, model = 'meta/llama-3.1-8b-instruct') => {
  return new AIProvider({
    apiKey,
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    model,
    embeddingModel: 'nvidia/nv-embed-v1', // Standard free tier embedding model
  });
};

export class LocalProvider extends AIProvider {
  constructor(model = 'llama3') {
    super({ 
      apiKey: 'ollama',
      baseUrl: 'http://localhost:11434/v1',
      model,
    });
  }
}

export const createLocalProvider = (model = 'llama3') => {
  return new LocalProvider(model);
};

export class TtsProvider {
  constructor(private config: TtsConfig) {}

  async generateSpeech(text: string): Promise<Buffer> {
    const url = this.config.baseUrl || 'https://integrate.api.nvidia.com/v1/audio/speech';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        input: text,
        voice: this.config.voice,
        response_format: 'wav',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TTS Error: ${response.status} - ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export const createNvidiaTtsProvider = (apiKey: string, model = 'nvidia/magpie-tts-zeroshot') => {
  return new TtsProvider({
    apiKey,
    baseUrl: 'https://integrate.api.nvidia.com/v1/audio/speech',
    model,
    voice: 'Magpie-ZeroShot.Female-1',
  });
};

export const createGroqTtsProvider = (
  apiKey: string,
  model = 'canopylabs/orpheus-v1-english',
  voice?: string,
  audioPrompt?: string
) => {
  return new TtsProvider({
    apiKey,
    baseUrl: 'https://api.groq.com/openai/v1/audio/speech',
    model,
    voice: voice || 'autumn',
    audioPrompt: audioPrompt || "Speak in a highly expressive, authentic, and wonderfully relatable human voice. Embody deep emotional resonance, gentle cadence, warm pauses, natural laughter inflections, and empathetic tone like a real close friend.",
  });
};

export interface SttConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export class SttProvider {
  constructor(private config: SttConfig) {}

  async transcribeAudio(audioBuffer: Buffer, filename = 'audio.wav'): Promise<string> {
    const url = this.config.baseUrl || 'https://api.groq.com/openai/v1/audio/transcriptions';
    
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: filename.endsWith('.webm') ? 'audio/webm' : 'audio/wav' });
    formData.append('file', blob, filename);
    formData.append('model', this.config.model);
    formData.append('response_format', 'json');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`STT Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.text;
  }
}

export const createGroqSttProvider = (apiKey: string, model = 'whisper-large-v3') => {
  return new SttProvider({
    apiKey,
    baseUrl: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model,
  });
};
