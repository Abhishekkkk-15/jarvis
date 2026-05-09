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
  connect: () => void;
  sendMessage: (content: string) => void;
  setActiveScreen: (screen: JarvisState['activeScreen']) => void;
  approveTool: (id: string, approved: boolean) => void;
}

export const useJarvisStore = create<JarvisState>((set, get) => ({
  messages: [],
  toolEvents: [],
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

    set({ socket });
  },

  approveTool: (id: string, approved: boolean) => {
    get().socket?.emit('approveTool', { id, approved });
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
