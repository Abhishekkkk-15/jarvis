import React, { useEffect } from 'react';
import { useJarvisStore } from '../store/useJarvisStore';
import { motion } from 'framer-motion';
import { Volume2, Gauge, Music, Mic, Check } from 'lucide-react';

export const VoiceSettings: React.FC = () => {
  const { settings, availableVoices, fetchVoices, updateVoiceSettings, fetchSettings } = useJarvisStore();

  useEffect(() => {
    fetchSettings();
    fetchVoices();
  }, []);

  if (!settings || !settings.voice) {
    return (
      <div className="p-4 text-center opacity-20 text-[10px] font-bold uppercase tracking-widest">
        Synchronizing...
      </div>
    );
  }

  const v = settings.voice;
  const voices = Array.isArray(availableVoices) ? availableVoices : [];

  return (
    <div className="space-y-8 p-2">
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          <Mic className="w-3 h-3" />
          System Voice
        </label>
        <div className="grid grid-cols-1 gap-2">
          {voices.map((voice) => (
            <button
              key={voice}
              onClick={() => updateVoiceSettings({ voiceId: voice })}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                v.voiceId === voice 
                  ? 'bg-primary/5 border-primary/20 text-primary' 
                  : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/10'
              }`}
            >
              <span className="text-sm font-medium">{voice}</span>
              {v.voiceId === voice && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              <Gauge className="w-3 h-3" />
              Speech Rate
            </label>
            <span className="text-[10px] font-mono font-bold text-primary">{v.rate > 0 ? `+${v.rate}` : v.rate}</span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            value={v.rate}
            onChange={(e) => updateVoiceSettings({ rate: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
              <Volume2 className="w-3 h-3" />
              Volume
            </label>
            <span className="text-[10px] font-mono font-bold text-primary">{v.volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={v.volume}
            onChange={(e) => updateVoiceSettings({ volume: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-black/5 dark:border-white/5">
        <button
          onClick={() => updateVoiceSettings({ autoSpeak: !v.autoSpeak })}
          className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all ${
            v.autoSpeak 
              ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
              : 'bg-black/5 dark:bg-white/5 border-transparent text-muted-foreground/60'
          }`}
        >
          <div className="flex flex-col items-start gap-0.5 text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest">Auto-Speak Responses</span>
            <span className="text-[9px] opacity-70">Jarvis will speak every response automatically</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${v.autoSpeak ? 'bg-white/20' : 'bg-black/10'}`}>
            <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${v.autoSpeak ? 'right-1' : 'left-1'}`} />
          </div>
        </button>
      </div>
    </div>
  );
};
