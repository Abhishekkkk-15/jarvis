import React, { useEffect } from 'react';
import { Settings, Key, Shield, User, Monitor, Volume2, Mic } from 'lucide-react';
import { VoiceSettings } from '../components/VoiceSettings';
import { useJarvisStore } from '../store/useJarvisStore';

export const SettingsScreen = () => {
  const { theme, setTheme, fetchSettings, settings } = useJarvisStore();
  const [keys, setKeys] = React.useState({ groq: '', nvidia: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    await fetch('http://localhost:3001/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  };

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 opacity-20">
          <Settings className="w-8 h-8 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Initializing Systems</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 scrollbar-hide overflow-y-auto h-full">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-1">Fine-tune your Jarvis autonomous experience.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Mic size={14} />
              Voice Intelligence
            </div>
            <div className="premium-glass p-6 rounded-[2rem]">
              <VoiceSettings />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Key size={14} />
              AI Gateways
            </div>
            <div className="grid gap-4">
              <div className="premium-glass p-6 rounded-3xl space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Groq Infrastructure</label>
                <input 
                  type="password" 
                  placeholder="gsk_..." 
                  className="w-full h-12 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-2xl px-4 text-sm outline-none transition-all" 
                  value={keys.groq}
                  onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
                />
              </div>
              <div className="premium-glass p-6 rounded-3xl space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">NVIDIA NIM Cluster</label>
                <input 
                  type="password" 
                  placeholder="nvapi-..." 
                  className="w-full h-12 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-2xl px-4 text-sm outline-none transition-all" 
                  value={keys.nvidia}
                  onChange={(e) => setKeys({ ...keys, nvidia: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Monitor size={14} />
              Visual Personality
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'calm', name: 'Calm Premium', desc: 'Minimalist & Airy' },
                { id: 'elite', name: 'Elite Protocol', desc: 'Neon HUD & Analytics' },
                { id: 'midnight', name: 'Midnight Noir', desc: 'Deep Black & Gold' }
              ].map((t) => (
                <button 
                  key={t.id} 
                  onClick={() => setTheme(t.id as any)}
                  className={`flex items-center justify-between p-6 rounded-3xl border transition-all text-left ${
                    theme === t.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' 
                      : 'premium-glass hover:border-primary/20'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest">{t.name}</div>
                    <div className={`text-[10px] ${theme === t.id ? 'opacity-70' : 'text-muted-foreground'}`}>{t.desc}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${theme === t.id ? 'bg-white' : 'bg-black/10 dark:bg-white/10'}`} />
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Shield size={14} />
              Privacy Protocol
            </div>
            <div className="premium-glass p-6 rounded-[2rem] flex items-center justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-tight">Active Supervision</div>
                <div className="text-[10px] text-muted-foreground mt-1">Manual tool authorization required</div>
              </div>
              <div className="w-10 h-6 bg-primary rounded-full relative shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="pt-12 border-t border-black/5 dark:border-white/5 flex justify-end items-center gap-8">
        <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">Jarvis Build 1.0.4-PRO</span>
        <button 
          onClick={async () => {
            if (keys.groq) await saveSetting('GROQ_API_KEY', keys.groq);
            if (keys.nvidia) await saveSetting('NVIDIA_API_KEY', keys.nvidia);
            alert('Core systems updated.');
          }}
          className="px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          Commit Changes
        </button>
      </div>
    </div>
  );
};
