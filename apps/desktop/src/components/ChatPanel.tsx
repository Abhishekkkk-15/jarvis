import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, ShieldCheck, Zap, Palette, Monitor, Moon, Sun } from 'lucide-react';
import { Message } from '@jarvis/shared';
import { ToolTimeline } from './tools/ToolTimeline';
import { useJarvisStore } from '../store/useJarvisStore';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = React.useState('');
  const { theme, setTheme } = useJarvisStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        <header className="h-14 flex items-center justify-between px-8 border-b border-black/5 dark:border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <Sparkles className="w-3 h-3 text-primary/60" />
            </div>
            <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/80">Jarvis Intelligence</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
              {[
                { id: 'calm', icon: Sun, label: 'Calm' },
                { id: 'elite', icon: Monitor, label: 'Elite' },
                { id: 'midnight', icon: Moon, label: 'Midnight' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-1.5 rounded-full transition-all ${
                    theme === t.id 
                      ? 'bg-card text-primary shadow-sm scale-110' 
                      : 'text-muted-foreground/40 hover:text-muted-foreground'
                  }`}
                  title={t.label}
                >
                  <t.icon className="w-3 h-3" />
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40 font-medium tracking-wide">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                <span>SECURE</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-black/5 dark:bg-white/5" />
              <div className="flex items-center gap-1.5 text-primary/40">
                <Zap className="w-3 h-3 fill-current" />
                <span>ACTIVE</span>
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
              <div className="w-16 h-16 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center animate-float">
                <Bot className="w-8 h-8 text-primary/40" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-light tracking-tight text-foreground/80">How may I assist you?</h3>
                <p className="text-sm text-muted-foreground/60 font-light max-w-sm leading-relaxed">
                  I am Jarvis, your personal agent. Ready to manage your tasks, files, and system with elegance and precision.
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
                
                <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`px-6 py-4 rounded-[1.5rem] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'rounded-tr-none bg-secondary/50 text-foreground shadow-sm' 
                      : 'rounded-tl-none bg-card text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 font-medium px-1 uppercase tracking-tighter">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Minimalist Input Area */}
        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto group">
            <div className="relative flex items-center bg-muted/40 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl px-6 py-4 transition-all duration-500 focus-within:bg-background focus-within:shadow-xl focus-within:shadow-black/5 focus-within:border-primary/20">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Compose a request..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground/40 font-light"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-6 flex justify-center items-center gap-10 text-[9px] text-muted-foreground/30 uppercase tracking-[0.3em] font-semibold">
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-muted rounded border border-black/5">⌘K</kbd>
                <span>Commands</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-black/5 dark:bg-white/5" />
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-1 bg-muted rounded border border-black/5">SPACE</kbd>
                <span>Voice</span>
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
