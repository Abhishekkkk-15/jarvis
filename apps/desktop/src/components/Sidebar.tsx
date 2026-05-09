import React from 'react';
import { MessageSquare, LayoutGrid, Settings, History, Brain, Mic } from 'lucide-react';
import { useJarvisStore } from '../store/useJarvisStore';
import { useVoiceManager } from '../hooks/useVoiceManager';

export function Sidebar() {
  const { activeScreen, setActiveScreen } = useJarvisStore();
  const { isListening, startListening, stopListening } = useVoiceManager();

  const navItems = [
    { icon: MessageSquare, label: 'Chat', id: 'chat' },
    { icon: LayoutGrid, label: 'Workflows', id: 'workflows' },
    { icon: Brain, label: 'Memory', id: 'memory' },
    { icon: History, label: 'History', id: 'history' },
  ] as const;

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground animate-pulse" />
          </div>
          <span className="font-semibold tracking-tight">Jarvis OS</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeScreen === item.id 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t space-y-2">
        <button 
          onClick={() => isListening ? stopListening() : startListening()}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isListening ? 'bg-primary text-white animate-pulse' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isListening ? 'Stop Listening' : 'Voice Mode'}
        </button>
        <button 
          onClick={() => setActiveScreen('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeScreen === 'settings' 
              ? 'bg-secondary text-foreground' 
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
