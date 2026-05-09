import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Command } from 'lucide-react';
import { Message } from '@jarvis/shared';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = React.useState('');
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12" />
            <div>
              <h3 className="font-medium">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground">Press Cmd+K for quick commands</p>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Jarvis anything..."
            className="w-full bg-muted/50 border border-border/50 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-4 flex justify-center items-center gap-6 text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">K</kbd>
            <span>Commands</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">SPACE</kbd>
            <span>Voice</span>
          </div>
        </div>
      </div>
    </div>
  );
}
