import React from 'react';
import { Settings, Key, Shield, User, Monitor } from 'lucide-react';

export const SettingsScreen = () => {
  const [keys, setKeys] = React.useState({ groq: '', nvidia: '' });

  React.useEffect(() => {
    fetch('http://localhost:3001/settings')
      .then(res => res.json())
      .then(data => {
        const groq = data.find((s: any) => s.key === 'GROQ_API_KEY')?.value || '';
        const nvidia = data.find((s: any) => s.key === 'NVIDIA_API_KEY')?.value || '';
        setKeys({ groq, nvidia });
      });
  }, []);

  const saveSetting = async (key: string, value: string) => {
    await fetch('http://localhost:3001/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your Jarvis experience.</p>
      </div>

      <div className="grid gap-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <Key size={18} className="text-primary" />
            AI Providers
          </div>
          <div className="grid gap-4">
            <div className="glass p-4 rounded-xl space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Groq API Key</label>
              <input 
                type="password" 
                placeholder="gsk_..." 
                className="w-full h-10 bg-secondary/30 border rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary outline-none" 
                value={keys.groq}
                onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
              />
            </div>
            <div className="glass p-4 rounded-xl space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">NVIDIA NIM Key</label>
              <input 
                type="password" 
                placeholder="nvapi-..." 
                className="w-full h-10 bg-secondary/30 border rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary outline-none" 
                value={keys.nvidia}
                onChange={(e) => setKeys({ ...keys, nvidia: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <Shield size={18} className="text-primary" />
            Safety & Permissions
          </div>
          <div className="glass p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Require confirmation for tools</div>
              <div className="text-xs text-muted-foreground">Ask before running potentially dangerous scripts</div>
            </div>
            <div className="w-10 h-5 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <Monitor size={18} className="text-primary" />
            Appearance
          </div>
          <div className="flex gap-4">
            {['Light', 'Dark', 'System'].map((theme) => (
              <button key={theme} className={`flex-1 glass p-4 rounded-xl text-sm font-medium hover:bg-primary hover:text-white transition-all ${theme === 'Dark' ? 'bg-primary text-white' : ''}`}>
                {theme}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="pt-8 border-t flex justify-end gap-4">
        <button className="px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-all">Cancel</button>
        <button 
          onClick={async () => {
            if (keys.groq) await saveSetting('GROQ_API_KEY', keys.groq);
            if (keys.nvidia) await saveSetting('NVIDIA_API_KEY', keys.nvidia);
            alert('Settings saved!');
          }}
          className="px-6 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
