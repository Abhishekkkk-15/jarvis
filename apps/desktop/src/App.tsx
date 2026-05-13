import React, { useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { CommandBar } from './components/CommandBar';
import { VoiceOrb } from './components/VoiceOrb';
import { useJarvisStore } from './store/useJarvisStore';
import { useVoiceManager } from './hooks/useVoiceManager';

import { WorkflowsScreen } from './screens/WorkflowsScreen';
import { MemoryScreen } from './screens/MemoryScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  const { messages, sendMessage, isConnected, activeScreen, settings, fetchSettings } = useJarvisStore();
  const agentName = settings?.agentName || 'Jarvis';
  const { isListening, isSpeaking, startListening, stopListening, speak } = useVoiceManager();
  const [showCommandBar, setShowCommandBar] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchSettings();
    }
  }, [isConnected]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        setShowCommandBar((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'chat':
        return <ChatPanel messages={messages} onSendMessage={sendMessage} />;
      case 'workflows':
        return <WorkflowsScreen />;
      case 'memory':
        return <MemoryScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <ChatPanel messages={messages} onSendMessage={sendMessage} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header 
          className="h-14 border-b flex items-center px-6 justify-between glass sticky top-0 z-10 select-none"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{agentName}</span>
            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-[10px] text-muted-foreground uppercase">{isConnected ? 'Online' : 'Offline'}</span>
            </div>

            {/* Custom Windows Action Controls */}
            <div className="flex items-center gap-1 ml-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              <button 
                onClick={() => (window as any).electron?.ipcRenderer?.send('window-minimize', {})}
                className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => (window as any).electron?.ipcRenderer?.send('window-maximize', {})}
                className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title="Maximize / Restore"
              >
                <Square className="w-3 h-3" />
              </button>
              <button 
                onClick={() => (window as any).electron?.ipcRenderer?.send('window-close', {})}
                className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {renderScreen()}
        
        {showCommandBar && <CommandBar onClose={() => setShowCommandBar(false)} />}
        <VoiceOrb 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          onToggle={() => isListening ? stopListening() : startListening()} 
        />
      </main>
    </div>
  );
}
