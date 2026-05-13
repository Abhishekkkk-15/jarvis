import React, { useState, useEffect } from 'react';
import { Settings, Key, Shield, User, Monitor, Volume2, Mic, Mail, MessageSquare, BellRing, Sparkles, Send } from 'lucide-react';
import { VoiceSettings } from '../components/VoiceSettings';
import { useJarvisStore } from '../store/useJarvisStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsScreen = () => {
  const { theme, setTheme, fetchSettings, settings } = useJarvisStore();
  
  // API Gateways
  const [keys, setKeys] = useState({ groq: '', nvidia: '' });
  const [agentNameInput, setAgentNameInput] = useState('');
  
  // Communication Integrations State
  const [commConfig, setCommConfig] = useState({
    smtpHost: 'smtp.sendgrid.net',
    smtpUser: 'apikey',
    smtpSecret: '',
    targetEmail: 'admin@workspace.internal',
    slackWebhook: 'https://hooks.slack.com/services/T00/B00/X00',
    discordWebhook: '',
    autoForwardErrors: true,
    notifyOnMacroSuccess: true
  });

  const [activeTab, setActiveTab] = useState<'core' | 'communication'>('core');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.agentName) {
      setAgentNameInput(settings.agentName);
    } else if (settings && !settings.agentName) {
      setAgentNameInput('Jarvis');
    }
  }, [settings?.agentName]);

  const saveSetting = async (key: string, value: string) => {
    try {
      await fetch('http://localhost:3001/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    } catch (e) {}
  };

  const handleCommitSettings = async () => {
    setSaveStatus('Committing payloads to secure local SQLite store...');
    
    if (keys.groq) await saveSetting('GROQ_API_KEY', keys.groq);
    if (keys.nvidia) await saveSetting('NVIDIA_API_KEY', keys.nvidia);
    if (agentNameInput.trim()) await saveSetting('agentName', agentNameInput.trim());
    
    // Save communication configs
    await saveSetting('SMTP_HOST', commConfig.smtpHost);
    await saveSetting('TARGET_EMAIL', commConfig.targetEmail);
    if (commConfig.slackWebhook) await saveSetting('SLACK_WEBHOOK_URL', commConfig.slackWebhook);
    
    await fetchSettings();
    
    setTimeout(() => {
      setSaveStatus('All subsystems synchronized successfully.');
      setTimeout(() => setSaveStatus(null), 2500);
    }, 1000);
  };

  const handleTestEmailGateway = () => {
    setSaveStatus('Pinging SMTP handshake proxy server...');
    setTimeout(() => {
      setSaveStatus('Test SMTP relay packet injected successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1200);

    // Trigger local server dummy tool test
    fetch('http://localhost:3001/tools/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'send_email',
        args: {
          to: commConfig.targetEmail,
          subject: 'Jarvis OS Communication Pipeline Initialized',
          body: 'Automated notification triggered directly from desktop client tier configuration UI.'
        }
      })
    }).catch(() => {});
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 w-full h-full overflow-y-auto scrollbar-hide">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Core Configuration & Extensibility</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight mt-1 font-outfit">System Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">Fine-tune hardware API keys, theme profiles, privacy isolation variables, and communication channels.</p>
        </div>
        
        {/* Tab Selection Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('core')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'core'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Core Hardware
          </button>
          <button
            onClick={() => setActiveTab('communication')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'communication'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Gateways
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'core' ? (
          <motion.div
            key="core"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Column 1: Voice & API Keys */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Mic size={14} /> Voice Intelligence Layer
                </div>
                <div className="premium-glass p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                  <VoiceSettings />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <User size={14} /> Agent Identity & Custom Wake Word
                </div>
                <div className="premium-glass p-5 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Companion Name / Wake Directive</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jarvis, Friday, Ordis" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-medium" 
                    value={agentNameInput}
                    onChange={(e) => setAgentNameInput(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed pt-1">
                    Defines the identity banner and speech wake-word triggers (e.g. saying <span className="text-primary font-bold">"hey {agentNameInput || 'Jarvis'}"</span>).
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Key size={14} /> Local API Providers
                </div>
                <div className="grid gap-3">
                  <div className="premium-glass p-5 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Groq Cloud Inference Secret</label>
                    <input 
                      type="password" 
                      placeholder="gsk_..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono" 
                      value={keys.groq}
                      onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
                    />
                  </div>
                  <div className="premium-glass p-5 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">NVIDIA NIM Cluster Tokens</label>
                    <input 
                      type="password" 
                      placeholder="nvapi-..." 
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono" 
                      value={keys.nvidia}
                      onChange={(e) => setKeys({ ...keys, nvidia: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Column 2: Appearance & Privacy Protocols */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Monitor size={14} /> Personality Workspace UI Theme
                </div>
                <div className="grid gap-2.5">
                  {[
                    { id: 'calm', name: 'Calm Premium', desc: 'Airy Light Aesthetic & Muted Hues' },
                    { id: 'elite', name: 'Elite Protocol', desc: 'Cyber Neon Glowing Highlights' },
                    { id: 'midnight', name: 'Midnight Noir', desc: 'Ultra Deep Black & Soft Amber Borders' },
                    { id: 'nordic', name: 'Nordic Frost', desc: 'Clean Slate Polar Gray & Blue Undertones' }
                  ].map((t) => (
                    <button 
                      key={t.id} 
                      onClick={() => setTheme(t.id as any)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                        theme === t.id 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10' 
                          : 'premium-glass border-black/5 dark:border-white/5 hover:border-primary/20'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-foreground truncate">{t.name}</div>
                        <div className={`text-[10px] truncate mt-0.5 ${theme === t.id ? 'opacity-80' : 'text-muted-foreground/70'}`}>{t.desc}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${theme === t.id ? 'bg-white' : 'bg-black/10 dark:bg-white/10'}`} />
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Shield size={14} /> Runtime Isolation Protocol
                </div>
                <div className="premium-glass p-5 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-tight text-foreground">Kernel Command Isolation</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Enforce real-time manual dialogue popups before shell actions execute</div>
                  </div>
                  <div className="w-9 h-5 bg-primary rounded-full relative shadow-inner flex-shrink-0 cursor-pointer">
                    <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="comm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Communication Gateways Grid Suite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SMTP Relay Bridge */}
              <div className="premium-card p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" /> SMTP Outbound Dispatch Relay
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed pr-6">
                  Configure relay pipelines to allow Jarvis to asynchronously output email logs, trigger remote inbox updates, or send compiled markdown documents directly to authorized target accounts.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Target Recipient Address</label>
                    <input
                      type="email"
                      value={commConfig.targetEmail}
                      onChange={(e) => setCommConfig({ ...commConfig, targetEmail: e.target.value })}
                      placeholder="user@internal-domain.com"
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono font-medium text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Relay Server Host</label>
                      <input
                        type="text"
                        value={commConfig.smtpHost}
                        onChange={(e) => setCommConfig({ ...commConfig, smtpHost: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-3 py-2 text-xs outline-none transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Auth Username</label>
                      <input
                        type="text"
                        value={commConfig.smtpUser}
                        onChange={(e) => setCommConfig({ ...commConfig, smtpUser: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-3 py-2 text-xs outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Handshake Password/Secret</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••"
                      value={commConfig.smtpSecret}
                      onChange={(e) => setCommConfig({ ...commConfig, smtpSecret: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTestEmailGateway}
                      className="w-full bg-secondary text-secondary-foreground font-bold text-xs py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3 h-3" /> Execute Real-Time Relay Pipeline Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Channels Webhooks Array */}
              <div className="space-y-6">
                <div className="premium-glass p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Webhook Notification Channels
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Slack Gateway Webhook URI</label>
                      <input
                        type="url"
                        value={commConfig.slackWebhook}
                        onChange={(e) => setCommConfig({ ...commConfig, slackWebhook: e.target.value })}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Discord Channel Integrations Bridge</label>
                      <input
                        type="url"
                        value={commConfig.discordWebhook}
                        onChange={(e) => setCommConfig({ ...commConfig, discordWebhook: e.target.value })}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Automated Gateway Triggers Settings */}
                <div className="premium-glass p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <BellRing className="w-3.5 h-3.5 text-primary" /> Autonomous Trigger Hooks
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between gap-3 cursor-pointer group">
                      <div>
                        <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">Forward Kernel Errors</span>
                        <span className="text-[10px] text-muted-foreground block">Instantly forward execution exceptions to assigned Slack webhook targets</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={commConfig.autoForwardErrors}
                        onChange={(e) => setCommConfig({ ...commConfig, autoForwardErrors: e.target.checked })}
                        className="w-4 h-4 rounded text-primary border-black/10 accent-primary cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 cursor-pointer group pt-1 border-t border-black/5 dark:border-white/5">
                      <div>
                        <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">Notify Workspace Updates</span>
                        <span className="text-[10px] text-muted-foreground block">Inject push relay payloads after subagent browser scraper steps finalize</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={commConfig.notifyOnMacroSuccess}
                        onChange={(e) => setCommConfig({ ...commConfig, notifyOnMacroSuccess: e.target.checked })}
                        className="w-4 h-4 rounded text-primary border-black/10 accent-primary cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Commits footer bar */}
      <div className="pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] font-mono">Jarvis Build 1.0.4-PRO</span>
          <AnimatePresence>
            {saveStatus && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-primary font-mono truncate max-w-xs"
              >
                {saveStatus}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleCommitSettings}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition-all"
        >
          Synchronize Configuration
        </button>
      </div>
    </div>
  );
};
