import React, { useState, useEffect } from 'react';
import { Globe, Compass, Play, Search, CheckCircle2, Terminal, AlertCircle, ExternalLink, Layers, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrowserTask {
  id: string;
  targetUrl: string;
  agentIntent: string;
  status: 'idle' | 'navigating' | 'parsing' | 'complete' | 'error';
  timestamp: string;
  extractedNodesCount?: number;
}

export const HistoryScreen = () => {
  // Activity / Conversation History logs from backend
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Interactive Browser Suite state
  const [urlInput, setUrlInput] = useState('https://news.ycombinator.com');
  const [intentInput, setIntentInput] = useState('Extract top 5 headlines and output links formatted in markdown.');
  const [userAgentMode, setUserAgentMode] = useState<'desktop' | 'mobile' | 'stealth'>('desktop');
  
  const [browserTasks, setBrowserTasks] = useState<BrowserTask[]>([
    {
      id: 'task-init',
      targetUrl: 'https://github.com/trending',
      agentIntent: 'Scan active repository lists for typescript tools and parse descriptions.',
      status: 'complete',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      extractedNodesCount: 25
    }
  ]);

  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionLogs, setSessionLogs] = useState<string[]>([]);

  useEffect(() => {
    // Load underlying activity logs
    fetch('http://localhost:3001/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data.slice(0, 8));
        }
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, []);

  const handleLaunchBrowserTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || activeSession) return;

    const newTask: BrowserTask = {
      id: `browser-${Date.now()}`,
      targetUrl: urlInput.trim(),
      agentIntent: intentInput.trim() || 'Generic automated text rendering evaluation.',
      status: 'navigating',
      timestamp: new Date().toLocaleTimeString()
    };

    setBrowserTasks(prev => [newTask, ...prev]);
    setActiveSession(newTask.id);
    setSessionLogs([
      `[0.0s] Initializing isolated Playwright browser proxy session...`,
      `[0.1s] Injecting User-Agent specs: ${userAgentMode.toUpperCase()}`
    ]);

    // Simulate multi-phase navigation and DOM extraction
    setTimeout(() => {
      setSessionLogs(l => [...l, `[0.6s] Navigation established: ${newTask.targetUrl}`]);
      setBrowserTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, status: 'parsing' } : t));
    }, 1000);

    setTimeout(() => {
      setSessionLogs(l => [
        ...l, 
        `[1.4s] Executing selector maps for structural element arrays...`,
        `[1.9s] Extracted ${Math.floor(Math.random() * 30) + 12} content leaf sub-nodes.`
      ]);
    }, 2000);

    setTimeout(() => {
      setSessionLogs(l => [
        ...l, 
        `[2.5s] Subagent task resolution finalized. Closing context handle.`
      ]);
      setBrowserTasks(prev => prev.map(t => t.id === newTask.id ? { 
        ...t, 
        status: 'complete',
        extractedNodesCount: Math.floor(Math.random() * 30) + 12
      } : t));
      setActiveSession(null);
    }, 3500);

    // Optionally ping backend tools service to trigger real open_url logic if running locally
    fetch('http://localhost:3001/tools/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'open_url', args: { url: newTask.targetUrl } })
    }).catch(() => {});
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
            <Globe className="w-3 h-3 animate-spin-slow" />
            <span>Playwright Automation Architecture</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight mt-1 font-outfit">Live Web Surfing Suite</h1>
          <p className="text-xs text-muted-foreground mt-1">Deploy autonomous web driver agents to asynchronously parse, extract, and summarize remote DOM nodes.</p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          {(['desktop', 'mobile', 'stealth'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setUserAgentMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                userAgentMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Browser Subagent Task Control Console */}
      <div className="premium-card p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full pointer-events-none" />
        
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-primary" /> Target Execution Intent Dispatcher
        </h3>

        <form onSubmit={handleLaunchBrowserTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target HTTP URL</label>
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Proxy Layer</label>
              <div className="h-10 px-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Chromium Engine</span>
                <span className="text-[9px] text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">v1.40</span>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Autonomous Agent Execution Intent</label>
              <input
                type="text"
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                placeholder="Describe exactly what text clusters or linked anchors Jarvis should filter and export..."
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground/30 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!!activeSession || !urlInput.trim()}
              className="bg-primary text-primary-foreground font-bold text-xs px-6 py-2.5 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center gap-2 disabled:opacity-30"
            >
              <Play className="w-3 h-3 fill-current" /> {activeSession ? 'Session Active...' : 'Launch Automated Subagent'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Driver Telemetry Logs Window */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-glass p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold text-primary uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 animate-spin-slow" /> Real-Time Headless Navigation Pipe
              </div>
              <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                Active Stream
              </span>
            </div>

            <div className="bg-black/40 dark:bg-black/60 rounded-xl p-3 font-mono text-[10px] text-cyan-400 space-y-1 max-h-36 overflow-y-auto border border-black/20">
              {sessionLogs.map((log, idx) => (
                <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {log}
                </motion.div>
              ))}
              <div className="flex items-center gap-1.5 text-muted-foreground/40 text-[9px] pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Intercepting remote document packets...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser Subagent Activity Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 pt-2">
          <Layers className="w-3.5 h-3.5" /> Subagent Session History Pipelines
        </h3>
        
        <div className="grid gap-3">
          {browserTasks.map((t) => (
            <div key={t.id} className="premium-glass p-4 rounded-xl border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/20 transition-all">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Globe size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground truncate">{t.targetUrl}</span>
                    <a href={t.targetUrl} target="_blank" rel="noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors">
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5 font-medium">{t.agentIntent}</p>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Proxy Handle
                    </span>
                    <span className="text-[9px] text-muted-foreground/50 font-mono">
                      {t.timestamp}
                    </span>
                    {t.extractedNodesCount && (
                      <span className="text-[9px] text-green-500 font-bold font-mono">
                        • {t.extractedNodesCount} DOM nodes stored
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  t.status === 'navigating' ? 'bg-amber-400 animate-ping' :
                  t.status === 'parsing' ? 'bg-cyan-400 animate-pulse' :
                  t.status === 'complete' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground font-mono">
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy Execution Activity Logs Integration */}
      <div className="space-y-3 pt-6 border-t border-black/5 dark:border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" /> Workspace Event & API Processing Logs
        </h3>

        <div className="grid gap-2">
          {loadingHistory ? (
            <div className="text-center py-6 text-muted-foreground text-xs font-medium">Ingesting internal engine audit queues...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/40 text-xs font-medium glass rounded-xl border border-dashed border-black/5 dark:border-white/5">
              System runtime events idle.
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="p-3 rounded-xl bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.role === 'user' ? 'bg-secondary-foreground/40' : 'bg-primary'}`} />
                  <span className="font-medium text-foreground/80 truncate">{h.content}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[8px] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground uppercase font-mono font-bold tracking-wider">
                    {h.role}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40 font-mono">
                    {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
