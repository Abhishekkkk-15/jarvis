import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Message } from '@jarvis/shared';

interface ToolEvent {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  args?: any;
  result?: any;
  timestamp: Date;
}

interface JarvisState {
  messages: Message[];
  toolEvents: ToolEvent[];
  isConnected: boolean;
  socket: any | null;
  activeScreen: 'chat' | 'workflows' | 'memory' | 'history' | 'settings';
  theme: 'elite' | 'calm' | 'midnight' | 'nordic';
  isListening: boolean;
  isSpeaking: boolean;
  settings: any;
  availableVoices: string[];
  connect: () => void;
  sendMessage: (content: string) => void;
  setActiveScreen: (screen: JarvisState['activeScreen']) => void;
  setTheme: (theme: JarvisState['theme']) => void;
  setIsListening: (isListening: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  fetchSettings: () => Promise<void>;
  updateVoiceSettings: (voice: any) => Promise<void>;
  fetchVoices: () => Promise<void>;
  speak: (text: string) => void;
  approveTool: (id: string, approved: boolean) => void;
}

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  toolEvents: [],
  isConnected: false,
  socket: null,
  activeScreen: 'chat',
  theme: 'calm',
  isListening: false,
  isSpeaking: false,
  settings: null,
  availableVoices: [],

  connect: () => {
    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to Jarvis Server');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.warn('Disconnected from Jarvis Server');
      set({ isConnected: false });
    });

    socket.on('connect_error', (err) => {
      console.error('Connection Error:', err.message);
      set({ isConnected: false });
    });
    
    socket.on('chatUpdate', (update: { content: string, isFinal: boolean }) => {
      set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          const updatedMessages = [...state.messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMsg,
            content: update.content,
            isFinal: update.isFinal,
          };
          return { messages: updatedMessages };
        } else {
          return {
            messages: [
              ...state.messages,
              {
                id: Math.random().toString(),
                role: 'assistant',
                content: update.content,
                timestamp: new Date(),
                isFinal: update.isFinal,
              },
            ],
          };
        }
      });
    });

    socket.on('toolStart', (event: { name: string, id: string, args: any }) => {
      set((state) => ({
        toolEvents: [
          ...state.toolEvents,
          {
            id: event.id,
            name: event.name,
            status: 'running',
            args: event.args,
            timestamp: new Date(),
          },
        ],
      }));
    });

    socket.on('toolEnd', (event: { id: string, result: any }) => {
      set((state) => ({
        toolEvents: state.toolEvents.map((te) =>
          te.id === event.id
            ? { ...te, status: event.result?.error ? 'error' : 'completed', result: event.result }
            : te
        ),
      }));
    });

    socket.on('toolApprovalRequired', (event: { name: string, id: string, args: any }) => {
      set((state) => ({
        toolEvents: state.toolEvents.map((te) =>
          te.id === event.id
            ? { ...te, status: 'running' } // Visual hint that it's waiting
            : te
        ),
      }));
      // We could also show a global modal or a notification here
    });

    socket.on('audioPlayback', (payload: { audioBase64: string }) => {
      try {
        set({ isSpeaking: true });
        const audio = new Audio(`data:audio/wav;base64,${payload.audioBase64}`);
        audio.onended = () => set({ isSpeaking: false });
        audio.onerror = () => set({ isSpeaking: false });
        audio.play().catch((err) => {
          console.error('Audio playback failed:', err);
          set({ isSpeaking: false });
        });
      } catch (e) {
        console.error('Audio setup failed:', e);
        set({ isSpeaking: false });
      }
    });

    set({ socket });
  },

  approveTool: (id: string, approved: boolean) => {
    get().socket?.emit('approveTool', { id, approved });
  },

  sendMessage: (content: string) => {
    const { socket, messages, isConnected } = get();
    
    // 1. Local optimistic update
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    set({ messages: [...messages, userMsg] });

    // 2. Check connection
    if (!socket || !isConnected) {
      setTimeout(() => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: 'err-' + Math.random(),
              role: 'assistant',
              content: '⚠️ **Connection Error:** I am currently offline. Please ensure the Jarvis server is running and try again.',
              timestamp: new Date(),
              isFinal: true
            }
          ]
        }));
      }, 500);
      return;
    }

    // 3. Emit
    socket.emit('sendMessage', { content });
  },
  
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },
  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  
  fetchSettings: async () => {
    const res = await fetch('http://localhost:3001/settings');
    const settings = await res.json();
    set({ settings });
  },

  updateVoiceSettings: async (voice) => {
    await fetch('http://localhost:3001/settings/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voice),
    });
    get().fetchSettings();
  },

  fetchVoices: async () => {
    const res = await fetch('http://localhost:3001/settings/voices');
    const voices = await res.json();
    set({ availableVoices: voices });
  },

  speak: (text) => {
    get().socket?.emit('speak', { text });
  },
}));
