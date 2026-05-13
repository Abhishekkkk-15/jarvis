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
  const [appMode, setAppMode] = useState<'desktop' | 'pulse'>('desktop');

  useEffect(() => {
    const removeListener = (window as any).electron?.ipcRenderer?.on('set-mode', (newMode: 'desktop' | 'pulse') => {
      setAppMode(newMode);
    });
    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  useEffect(() => {
    if (appMode === 'pulse') {
      document.body.classList.add('mode-pulse');
      // Automatically activate Background Hands-Free Listening engine
      if (!isListening) {
        startListening();
      }
    } else {
      document.body.classList.remove('mode-pulse');
      if (isListening) {
        stopListening();
      }
    }
  }, [appMode, isListening, startListening, stopListening]);

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

  if (appMode === 'pulse') {
    return (
      <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden bg-transparent select-none">
        {/* Animated Expanding Ripple Layers */}
        <div className="w-32 h-32 absolute flex items-center justify-center pointer-events-none">
          <div className="animate-neural-ring" style={{ animationDelay: '0s' }} />
          <div className="animate-neural-ring" style={{ animationDelay: '1.2s' }} />
          <div className="animate-neural-ring" style={{ animationDelay: '2.4s' }} />
        </div>

        {/* Central Core Element - Intercepts Clicks when hovered to restore full view */}
        <div 
          onClick={() => (window as any).electron?.ipcRenderer?.send('window-restore', {})}
          onMouseEnter={() => (window as any).electron?.ipcRenderer?.send('set-ignore-mouse-events', false)}
          onMouseLeave={() => (window as any).electron?.ipcRenderer?.send('set-ignore-mouse-events', true)}
          className={`w-12 h-12 rounded-full ${isSpeaking ? 'bg-amber-500 animate-bounce' : isListening ? 'bg-red-500 animate-pulse' : 'bg-primary'} flex items-center justify-center animate-neural-core cursor-pointer relative z-10 hover:scale-125 transition-all duration-300 border border-primary-foreground/20 shadow-lg group`}
          title={isSpeaking ? "Jarvis Speaking..." : isListening ? "Hands-Free Listening Active..." : "Click to Restore Jarvis"}
        >
          <div className="w-4 h-4 rounded-full bg-primary-foreground/90 group-hover:bg-primary-foreground transition-colors animate-pulse" />
        </div>

        {/* Tiny Floating Connection Specs */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary tracking-widest uppercase opacity-60 pointer-events-none">
          {agentName}
        </div>
      </div>
    );
  }

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
