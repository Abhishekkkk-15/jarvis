import React, { useState, useEffect } from 'react';
import { Play, Plus, Zap, MousePointerClick, Eye, Keyboard, CheckCircle2, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MacroAction {
  id: string;
  name: string;
  description: string;
  type: 'vision' | 'mouse' | 'keyboard' | 'compound';
  targetSpecs: string;
  status: 'idle' | 'scanning' | 'executing' | 'complete';
}

export const WorkflowsScreen = () => {
  const [workflows, setWorkflows] = useState<MacroAction[]>([
    {
      id: 'macro-1',
      name: 'Vision Action Engine: GUI Locator',
      description: 'Captures active desktop viewport, processes spatial bounding boxes, and automatically hovers interactive target icons.',
      type: 'vision',
      targetSpecs: 'VISION_BOUND("Primary Action Button")',
      status: 'idle'
    },
    {
      id: 'macro-2',
      name: 'IDE Workspace Launcher Sequence',
      description: 'Translates global screen coordinates to reset multi-app dashboard splits and execute dev server launch commands.',
      type: 'compound',
      targetSpecs: 'CLICK(120, 45) -> TYPE("npm run dev") -> KEY(Enter)',
      status: 'idle'
    },
    {
      id: 'macro-3',
      name: 'Secure Token Key Auto-Injector',
      description: 'Injects authorized runtime variables directly into active focus textfields utilizing headless virtual input arrays.',
      type: 'keyboard',
      targetSpecs: 'TYPE_SECRET(env.AUTH_TOKEN)',
      status: 'idle'
    }
  ]);

  const [loading, setLoading] = useState(false);
  
  // Custom Macro Generation State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'vision' | 'mouse' | 'keyboard' | 'compound'>('vision');
  const [newSpecs, setNewSpecs] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Live Simulation state
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);
  const [traceLogs, setTraceLogs] = useState<string[]>([]);

  useEffect(() => {
    // Optionally sync remote workflows
    fetch('http://localhost:3001/workflows')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const apiFlows: MacroAction[] = data.map((w: any) => ({
            id: w.id || `remote-${Date.now()}`,
            name: w.name,
            description: w.description || 'Remote automated workflow definition.',
            type: 'compound',
            targetSpecs: w.definition?.specs || 'GENERIC_TASK_SEQUENCE',
            status: 'idle'
          }));
          setWorkflows(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newFlows = apiFlows.filter(f => !existingIds.has(f.id));
            return [...prev, ...newFlows];
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMacro: MacroAction = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Custom user-defined runtime sequence.',
      type: newType,
      targetSpecs: newSpecs.trim() || 'CLICK(0, 0)',
      status: 'idle'
    };

    setWorkflows(prev => [newMacro, ...prev]);
    setNewName('');
    setNewDesc('');
    setNewSpecs('');
    setShowForm(false);
    setCreationSuccess(true);
    setTimeout(() => setCreationSuccess(false), 3000);

    // Optionally emit POST to server
    fetch('http://localhost:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newMacro.name,
        description: newMacro.description,
        definition: { specs: newMacro.targetSpecs, type: newMacro.type }
      })
    }).catch(() => {});
  };

  const executeMacro = (id: string) => {
    // Prevent overlapping executions
    if (activeTraceId) return;

    setActiveTraceId(id);
    setTraceLogs([]);

    // Set state to scanning
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: 'scanning' } : w));
    setTraceLogs(l => [...l, `[0.0s] Initiating hardware macro task proxy for target segment...`]);

    setTimeout(() => {
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: 'executing' } : w));
      setTraceLogs(l => [
        ...l, 
        `[0.4s] Vision context loaded. Spatial array grid initialized.`,
        `[0.8s] Resolving absolute viewport constraints for command string.`
      ]);
    }, 800);

    setTimeout(() => {
      setTraceLogs(l => [
        ...l, 
        `[1.2s] Dispatched virtual hardware event sequence.`,
        `[1.5s] Input sequence processed successfully. Output stream confirmed.`
      ]);
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: 'complete' } : w));
    }, 1600);

    setTimeout(() => {
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: 'idle' } : w));
      setActiveTraceId(null);
    }, 3200);
  };

  const getIcon = (type: MacroAction['type']) => {
    switch (type) {
      case 'vision': return <Eye className="w-5 h-5 text-cyan-400" />;
      case 'mouse': return <MousePointerClick className="w-5 h-5 text-amber-400" />;
      case 'keyboard': return <Keyboard className="w-5 h-5 text-emerald-400" />;
      case 'compound': return <Zap className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
            <Cpu className="w-3 h-3 animate-pulse" />
            <span>Nut-JS & Vision Stack Layer</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight mt-1 font-outfit">Desktop Automation Engine</h1>
          <p className="text-xs text-muted-foreground mt-1">Orchestrate complex hardware proxy input arrays, dynamic UI button bounding locators, and automated desktop sequences.</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground font-bold text-xs px-5 py-3 rounded-2xl hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Hide Form' : 'New Custom Macro'}
        </button>
      </div>

      <AnimatePresence>
        {creationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="premium-glass p-4 rounded-xl border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> New automation macro payload compiled and registered to kernel space.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Creation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="premium-card p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70">Macro Instruction Builder</h3>
              <form onSubmit={handleCreateMacro} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action Identifier</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Photoshop Batch Exporter"
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hardware Target Modality</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-bold text-muted-foreground cursor-pointer"
                  >
                    <option value="vision">Vision Bounding Box (GUI Locator)</option>
                    <option value="mouse">Mouse Array (Absolute Coordinates)</option>
                    <option value="keyboard">Keyboard Stream (Text & Hotkeys)</option>
                    <option value="compound">Compound Multi-Step Run</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Execution Instructions Specifications</label>
                  <input
                    type="text"
                    value={newSpecs}
                    onChange={(e) => setNewSpecs(e.target.value)}
                    placeholder='e.g. VISION_BOUND("Export As") -> CLICK() -> TYPE("final_render")'
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono text-primary placeholder:text-muted-foreground/30 font-bold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description Details</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Explain what spatial components or UI items this macro interacts with..."
                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-medium placeholder:text-muted-foreground/30"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground font-bold text-xs px-6 py-2.5 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md"
                  >
                    Register Sequence
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Visual Tracing Simulator HUD */}
      <AnimatePresence>
        {activeTraceId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="premium-glass p-6 rounded-[1.5rem] border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                <Terminal className="w-4 h-4 animate-spin-slow" /> Virtual Desktop Driver Stream Trace
              </div>
              <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Live Simulation Proxy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Simulated UI Bounding Box Overlay */}
              <div className="border border-black/10 dark:border-white/10 rounded-xl p-3 bg-black/2 dark:bg-white/2 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Viewport Vision Context</div>
                <div className="w-full h-16 border border-dashed border-cyan-500/40 rounded flex items-center justify-center relative mt-2 bg-cyan-500/5">
                  <div className="absolute top-1 left-1 text-[7px] text-cyan-500 font-mono">BBOX: [450, 220, w:120, h:35]</div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
                  <span className="text-[9px] text-cyan-500 font-bold tracking-wider">Target Identifiers Locked</span>
                </div>
              </div>

              {/* Execution Trace Logs Console */}
              <div className="md:col-span-2 bg-black/40 dark:bg-black/60 rounded-xl p-3 font-mono text-[10px] space-y-1.5 overflow-hidden flex flex-col justify-end text-green-400 border border-black/20">
                {traceLogs.map((log, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                    {log}
                  </motion.div>
                ))}
                <div className="flex items-center gap-1.5 text-muted-foreground/40 text-[9px] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Directing nut-js screen driver outputs...
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Automated Macros Cluster List */}
      <div className="space-y-4">
        {workflows.map((w) => (
          <div
            key={w.id}
            className={`premium-glass p-6 rounded-2xl border transition-all ${
              w.status !== 'idle' 
                ? 'border-primary shadow-xl shadow-primary/10 bg-primary/5' 
                : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform ${w.status !== 'idle' ? 'scale-110' : ''}`}>
                  {getIcon(w.type)}
                </div>
                
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-foreground tracking-tight">{w.name}</h3>
                    <span className="text-[9px] font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-muted-foreground font-semibold">
                      {w.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed pr-2">{w.description}</p>
                  
                  <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-primary font-bold truncate">
                    <span className="text-muted-foreground/40 font-normal">Payload Exec Specs:</span> {w.targetSpecs}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                <div className="flex items-center gap-1.5 pr-2">
                  <span className={`w-2 h-2 rounded-full ${
                    w.status === 'scanning' ? 'bg-amber-400 animate-ping' :
                    w.status === 'executing' ? 'bg-cyan-400 animate-pulse' :
                    w.status === 'complete' ? 'bg-green-500' : 'bg-black/20 dark:bg-white/20'
                  }`} />
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    {w.status}
                  </span>
                </div>

                <button
                  disabled={!!activeTraceId}
                  onClick={() => executeMacro(w.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    w.status !== 'idle'
                      ? 'bg-secondary text-secondary-foreground cursor-default'
                      : 'bg-primary text-primary-foreground hover:opacity-95 active:scale-95 disabled:opacity-30'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> {w.status !== 'idle' ? 'Tracing...' : 'Run Action'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded OS Isolation Warning Header */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-bold text-amber-500/90 uppercase tracking-wider text-[10px] block mb-0.5">Execution Safety Guidelines</span>
          Automated desktop sequences directly utilize hardware interrupt input layers. To test mouse clicks safely without unintended interference, ensure your terminal windows remain minimized while hardware macros resolve coordinate positioning arrays.
        </div>
      </div>
    </div>
  );
};
