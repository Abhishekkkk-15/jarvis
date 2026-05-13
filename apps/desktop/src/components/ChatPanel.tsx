import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, ShieldCheck, Zap, Palette, Monitor, Moon, Sun, Mic, MicOff, RotateCcw } from 'lucide-react';
import { Message } from '@jarvis/shared';
import { ToolTimeline } from './tools/ToolTimeline';
import { useJarvisStore } from '../store/useJarvisStore';
import { NeuralPulse } from './NeuralPulse';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = React.useState('');
  const { theme, setTheme, isListening, setIsListening, isSpeaking, speak, settings, isPersistentMode, setIsPersistentMode, clearMessages } = useJarvisStore();
  const agentName = settings?.agentName || 'Jarvis';
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-Speak Logic - Guaranteed strictly once per message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isFinal && settings?.voice?.autoSpeak) {
      const msgId = lastMsg.id || lastMsg.content;
      if (!spokenIdsRef.current.has(msgId)) {
        spokenIdsRef.current.add(msgId);
        speak(lastMsg.content);
      }
    }
  }, [messages, settings?.voice?.autoSpeak]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const resultsArray = Array.from(event.results);
        const transcript = resultsArray
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);

        const state = useJarvisStore.getState();
        if (state.isPersistentMode) {
          const lastResult: any = resultsArray[resultsArray.length - 1];
          if (lastResult && lastResult.isFinal) {
            const finalPhrase = lastResult[0].transcript.trim();
            const lowerPhrase = finalPhrase.toLowerCase();
            const wakeWord = (state.settings?.agentName || 'Jarvis').toLowerCase();
            if (lowerPhrase.startsWith(wakeWord) || lowerPhrase.includes(wakeWord) || lowerPhrase.startsWith('hey ' + wakeWord)) {
              setTimeout(() => {
                onSendMessage(finalPhrase);
                setInput('');
              }, 200);
            } else {
              // Ignore extraneous background speech
              setTimeout(() => setInput(''), 400);
            }
          }
        }
      };

      recognitionRef.current.onend = () => {
        const state = useJarvisStore.getState();
        if (state.isPersistentMode) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        const state = useJarvisStore.getState();
        if (!state.isPersistentMode) {
          setIsListening(false);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (isPersistentMode && recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {}
    } else if (!isPersistentMode && recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {}
    }
  }, [isPersistentMode]);

  const startVoice = () => {
    if (recognitionRef.current && !isListening) {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (input.trim()) {
        onSendMessage(input);
        setInput('');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useJarvisStore.getState();
      if (!state.isPersistentMode && e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        startVoice();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const state = useJarvisStore.getState();
      if (!state.isPersistentMode && e.code === 'Space') {
        stopVoice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background transition-colors duration-700">
      <div className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto border-x border-black/5 dark:border-white/5 shadow-2xl relative z-10 scanline">
        {/* Subtle Header */}
        <header className="h-14 flex items-center justify-between px-8 border-b border-black/5 dark:border-white/5 bg-background/30 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-foreground/40">Neural Core Active</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/30 font-bold tracking-[0.1em]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PROTECTED</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5 text-primary/60">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>STABLE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-8 py-12 space-y-10 scrollbar-hide">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative">
                <NeuralPulse active={isListening || isSpeaking} intensity={(isListening || isSpeaking) ? 'high' : 'medium'} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-light tracking-tight text-foreground/90 font-outfit">
                  {isListening ? "I'm listening..." : "Ready to assist you"}
                </h3>
                <p className="text-sm text-muted-foreground/40 font-light max-w-sm leading-relaxed mx-auto">
                  {isListening 
                    ? "Speak clearly. I am processing your neural intent."
                    : `I am ${agentName}. Your personal agent for the high-performance workspace.`
                  }
                </p>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  msg.role === 'user' 
                    ? 'bg-secondary text-secondary-foreground shadow-sm' 
                    : 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`px-6 py-4 rounded-[1.25rem] text-[13px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'rounded-tr-none bg-primary text-primary-foreground shadow-lg shadow-primary/10 font-medium border border-primary/20' 
                      : 'rounded-tl-none premium-card font-normal'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="text-[9px] text-muted-foreground/30 font-bold px-1 uppercase tracking-widest">
                    {msg.role === 'user' ? 'Local User' : 'System Jarvis'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Minimalist Input Area */}
        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto group relative">
            <div className={`relative flex items-center premium-glass rounded-[2rem] px-6 py-3 transition-all duration-700 ${
              isListening 
                ? 'ring-2 ring-primary shadow-2xl shadow-primary/20' 
                : 'focus-within:ring-1 focus-within:ring-primary/20'
            }`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isPersistentMode ? "Say 'Jarvis...' to command" : (isListening ? "Listening..." : "Type your command...")}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground/30 font-medium py-2"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPersistentMode(!isPersistentMode)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg ${
                    isPersistentMode
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-red-500/10'
                      : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                  title={isPersistentMode ? "Disable Hands-Free Mode" : "Enable Hands-Free Continuous Mode"}
                >
                  {isPersistentMode ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4 opacity-50" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-10 shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center items-center gap-6 text-[8px] text-muted-foreground/20 uppercase tracking-[0.4em] font-bold select-none">
              <button 
                type="button" 
                onClick={clearMessages}
                className="flex items-center gap-1.5 hover:text-primary transition-all cursor-pointer"
                title="Rotate conversation context to start fresh"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Rotate Context</span>
              </button>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-muted/50 rounded border border-border">⌘K</kbd>
                <span>Command Bar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-1.5 py-0.5 rounded border border-border transition-all ${isListening ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50'}`}>SPACE</kbd>
                <span className={isListening ? 'text-primary' : ''}>
                  {isPersistentMode ? 'Continuous Mode Active' : (isListening ? 'Live Recognition' : 'Hold to Speak')}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Elegant Sidebar */}
      <div className="w-80 border-l border-black/5 dark:border-white/5 bg-background/50 hidden lg:flex flex-col">
        <div className="p-6 pb-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 px-2">Operation Feed</h3>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <ToolTimeline />
        </div>
      </div>
    </div>
  );
}
