import React from 'react';
import { useJarvisStore } from '../../store/useJarvisStore';
import { motion, AnimatePresence } from 'framer-motion';

export const ToolTimeline: React.FC = () => {
  const toolEvents = useJarvisStore((state) => state.toolEvents);
  const approveTool = useJarvisStore((state) => state.approveTool);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Active Tools</h3>
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {toolEvents.slice().reverse().map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3 rounded-lg border flex flex-col gap-2 ${
                event.status === 'running' 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : event.status === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'running' ? 'bg-blue-400 animate-pulse' : 
                    event.status === 'error' ? 'bg-red-400' : 'bg-green-400'
                  }`} />
                  <span className="text-sm font-semibold text-gray-200">{event.name}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {event.args && (
                <div className="text-[11px] font-mono text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
                  {JSON.stringify(event.args, null, 2)}
                </div>
              )}

              {event.status === 'running' && event.name.includes('_') && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => approveTool(event.id, true)}
                    className="flex-1 py-1 px-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[11px] rounded transition-colors border border-green-500/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => approveTool(event.id, false)}
                    className="flex-1 py-1 px-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] rounded transition-colors border border-red-500/20"
                  >
                    Deny
                  </button>
                </div>
              )}

              {event.result && (
                <div className="text-[11px] font-mono text-gray-500 mt-1 border-t border-white/5 pt-2">
                  {event.result.error ? (
                    <span className="text-red-400">Error: {event.result.error}</span>
                  ) : (
                    <span className="text-green-400/70">Completed</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {toolEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
          <span className="text-xs">No tool activity yet</span>
        </div>
      )}
    </div>
  );
};
