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

  constructor(config: AIProviderConfig) {
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
