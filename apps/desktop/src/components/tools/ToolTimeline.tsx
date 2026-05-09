import React from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Check, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

export const ToolTimeline: React.FC = () => {
  const toolEvents = useJarvisStore((state) => state.toolEvents);
  const approveTool = useJarvisStore((state) => state.approveTool);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence initial={false}>
          {toolEvents.slice().reverse().map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`p-5 rounded-[1.25rem] border bg-card/30 backdrop-blur-sm transition-all duration-500 ${
                event.status === 'running' 
                  ? 'border-primary/10 ring-1 ring-primary/5' 
                  : event.status === 'error'
                  ? 'border-destructive/10'
                  : 'border-black/5 dark:border-white/5'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    event.status === 'running' 
                      ? 'bg-primary/5 text-primary' 
                      : event.status === 'error' 
                      ? 'bg-destructive/5 text-destructive' 
                      : 'bg-green-500/5 text-green-500/60'
                  }`}>
                    {event.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     event.status === 'error' ? <AlertCircle className="w-4 h-4" /> : 
                     <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-foreground/70 tracking-tight">{event.name}</h4>
                    <span className="text-[9px] text-muted-foreground/30 font-medium uppercase tracking-tighter">Instance: {event.id.slice(0, 6)}</span>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground/30 font-medium">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {event.args && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 opacity-30">
                    <Terminal className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Context</span>
                  </div>
                  <pre className="text-[10px] font-medium text-muted-foreground/50 bg-black/5 dark:bg-white/5 p-3 rounded-xl overflow-x-auto">
                    {JSON.stringify(event.args, null, 2)}
                  </pre>
                </div>
              )}

              {event.status === 'running' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 pt-2"
                >
                  <div className="text-[10px] text-primary/60 font-medium italic px-1">
                    Waiting for your confirmation...
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveTool(event.id, true)}
                      className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold text-[10px] rounded-xl shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      Permit
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => approveTool(event.id, false)}
                      className="flex-1 py-2.5 px-4 bg-secondary text-secondary-foreground font-semibold text-[10px] rounded-xl hover:bg-secondary/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      Deny
                    </button>
                  </div>
                </motion.div>
              )}

              {event.result && (
                <div className="mt-2 pt-3 border-t border-black/5 dark:border-white/5">
                  {event.result.error ? (
                    <div className="flex items-center gap-2 text-destructive/60">
                      <span className="text-[10px] font-medium italic truncate">Operation halted: {event.result.error}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between opacity-40">
                      <span className="text-[9px] font-semibold uppercase tracking-widest">Task Resolved</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {toolEvents.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
          <div className="w-10 h-10 rounded-2xl border border-foreground/20 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Idle State</span>
        </div>
      )}
    </div>
  );
};
