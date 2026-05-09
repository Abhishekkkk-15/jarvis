import React from 'react';
import { motion } from 'framer-motion';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
}

export function VoiceOrb({ isListening, isSpeaking, onToggle }: VoiceOrbProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div
        animate={{
          scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.1, 1] : 1,
          opacity: isListening || isSpeaking ? 1 : 0.5,
        }}
        transition={{
          repeat: Infinity,
          duration: isListening ? 1.5 : 3,
        }}
        onClick={onToggle}
        className={`w-16 h-16 rounded-full flex items-center justify-center relative cursor-pointer ${
          isListening ? 'bg-primary shadow-[0_0_30px_rgba(0,0,0,0.2)]' : 'bg-muted border border-border'
        }`}
      >
        {/* Core */}
        <div className={`w-8 h-8 rounded-full ${
          isListening ? 'bg-primary-foreground/20' : 'bg-primary/10'
        } flex items-center justify-center animate-pulse`}>
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Waves */}
        {isListening && (
          <>
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border border-primary"
            />
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute inset-0 rounded-full border border-primary/50"
            />
          </>
        )}

        {isSpeaking && (
          <motion.div
            animate={{ height: [4, 12, 4] }}
            transition={{ repeat: Infinity, duration: 0.5, times: [0, 0.5, 1] }}
            className="flex gap-1 absolute"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1 bg-primary rounded-full" />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
