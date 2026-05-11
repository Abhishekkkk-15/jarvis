import React from 'react';
import { motion } from 'framer-motion';

interface NeuralPulseProps {
  active?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function NeuralPulse({ active = false, intensity = 'medium' }: NeuralPulseProps) {
  const scaleMultipliers = {
    low: [1, 1.05, 1],
    medium: [1, 1.15, 1],
    high: [1, 1.3, 1],
  };

  const ringCount = 3;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Background Aura */}
      {active && (
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full blur-[80px]"
          animate={{
            scale: scaleMultipliers[intensity],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Concentric Rings */}
      {[...Array(ringCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/20"
          style={{
            width: `${100 - i * 20}%`,
            height: `${100 - i * 20}%`,
          }}
          animate={active ? {
            scale: scaleMultipliers[intensity],
            opacity: [0.1, 0.4, 0.1],
            borderColor: ['rgba(0, 242, 255, 0.1)', 'rgba(0, 242, 255, 0.4)', 'rgba(0, 242, 255, 0.1)'],
          } : {}}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Core Nucleus */}
      <motion.div
        className="relative w-12 h-12 rounded-full bg-primary shadow-[0_0_30px_rgba(0,242,255,0.4)] flex items-center justify-center"
        animate={active ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(0,242,255,0.3)',
            '0 0 40px rgba(0,242,255,0.6)',
            '0 0 20px rgba(0,242,255,0.3)',
          ],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/20 blur-[2px]" />
      </motion.div>

      {/* Rotating Data Orbitals */}
      {active && (
        <motion.div
          className="absolute inset-0 border border-dashed border-primary/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
}
