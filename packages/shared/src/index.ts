export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolResult {
  toolCallId: string;
  result: string;
  isError?: boolean;
}

export interface UserSettings {
  aiProvider: 'groq' | 'nvidia';
  model: string;
  voiceEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type WebSocketEvent = 
  | { type: 'CHAT_MESSAGE'; payload: Message }
  | { type: 'TOOL_START'; payload: { toolName: string; id: string } }
  | { type: 'TOOL_END'; payload: ToolResult }
  | { type: 'VOICE_TRANSCRIPTION'; payload: { text: string; isFinal: boolean } };
