import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Message } from '@jarvis/shared';

interface JarvisState {
  messages: Message[];
  isConnected: boolean;
  socket: any | null; // Using any for socket to avoid complex type issues if Socket is not properly imported
  activeScreen: 'chat' | 'workflows' | 'memory' | 'history' | 'settings';
  connect: () => void;
  sendMessage: (content: string) => void;
  setActiveScreen: (screen: JarvisState['activeScreen']) => void;
}

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  isConnected: false,
  socket: null,
  activeScreen: 'chat',

  connect: () => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));
    
    socket.on('chatUpdate', (update: { content: string, isFinal: boolean }) => {
      set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          const updatedMessages = [...state.messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMsg,
            content: update.content,
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
              },
            ],
          };
        }
      });
    });

    set({ socket });
  },

  sendMessage: (content: string) => {
    const { socket, messages } = get();
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set({ messages: [...messages, userMsg] });
    socket?.emit('sendMessage', { content });
  },
  
  setActiveScreen: (screen) => set({ activeScreen: screen }),
}));
