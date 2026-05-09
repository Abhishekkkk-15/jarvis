import React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, FileText, Settings, X } from 'lucide-react';

export function CommandBar({ onClose }: { onClose: () => void }) {
  const commands = [
    { icon: Globe, label: 'Open Browser', shortcut: 'B' },
    { icon: FileText, label: 'Search Files', shortcut: 'F' },
    { icon: Settings, label: 'Open Settings', shortcut: 'S' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-background border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none focus:outline-none text-lg"
          />
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-2">
          {commands.map((cmd) => (
            <button
              key={cmd.label}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-sm group"
            >
              <div className="flex items-center gap-3">
                <cmd.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                <span>{cmd.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] opacity-50 group-hover:opacity-100">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] opacity-50 group-hover:opacity-100">{cmd.shortcut}</kbd>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-t text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <span>Search for tools, workflows, or files</span>
          <span>Esc to close</span>
        </div>
      </motion.div>
    </div>
  );
}
