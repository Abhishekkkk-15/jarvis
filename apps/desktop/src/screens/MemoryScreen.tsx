import React, { useState, useEffect } from 'react';
import { Database, Search, Cpu, Plus, Tag, Trash2, Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryItem {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  vectors: number;
}

export const MemoryScreen = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: '1',
      content: 'Always format typescript modules with explicit return types and avoid any casting.',
      category: 'Guidelines',
      createdAt: new Date().toISOString(),
      vectors: 1536
    },
    {
      id: '2',
      content: 'User prefers elite theme with vibrant primary hues and dark mode aesthetics.',
      category: 'Preferences',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      vectors: 1536
    },
    {
      id: '3',
      content: 'Core project structure resides under D:\\js\\jarvis with multi-app workspace mapping.',
      category: 'Workspace',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      vectors: 1536
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Form state
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Workspace');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Optionally augment local memories with dynamic API history items
    fetch('http://localhost:3001/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const apiMemories = data
            .filter((m: any) => m.role === 'assistant' && m.content)
            .slice(0, 3)
            .map((m: any, idx: number) => ({
              id: `api-${idx}-${Date.now()}`,
              content: m.content.length > 120 ? m.content.substring(0, 120) + '...' : m.content,
              category: 'Context',
              createdAt: m.createdAt || new Date().toISOString(),
              vectors: 1536
            }));
          setMemories(prev => [...prev, ...apiMemories]);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newItem: MemoryItem = {
      id: `manual-${Date.now()}`,
      content: newContent.trim(),
      category: newCategory,
      createdAt: new Date().toISOString(),
      vectors: 1536
    };

    setMemories(prev => [newItem, ...prev]);
    setNewContent('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const tags = ['All', 'Workspace', 'Guidelines', 'Preferences', 'Context'];

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || m.category === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 w-full">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
            <Sparkles className="w-3 h-3 animate-spin-slow" />
            <span>Vector Neural Store</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight mt-1 font-outfit">Knowledge Base</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage semantic embeddings, context retrieval pipelines, and permanent instruction tags.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="premium-glass px-5 py-3 rounded-2xl border border-black/5 dark:border-white/5 text-center min-w-[110px]">
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Clusters</div>
            <div className="text-xl font-bold font-mono text-foreground mt-0.5">{memories.length}</div>
          </div>
          <div className="premium-glass px-5 py-3 rounded-2xl border border-black/5 dark:border-white/5 text-center min-w-[110px]">
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Dimensions</div>
            <div className="text-xl font-bold font-mono text-primary mt-0.5">1536</div>
          </div>
          <div className="premium-glass px-5 py-3 rounded-2xl border border-black/5 dark:border-white/5 text-center min-w-[110px] hidden sm:block">
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Status</div>
            <div className="text-xs font-bold text-green-500 uppercase tracking-wider mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Ready
            </div>
          </div>
        </div>
      </div>

      {/* Manual RAG Injection Form */}
      <div className="premium-card p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-4 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-primary" /> Inject Permanent Neural Knowledge
        </h3>
        
        <form onSubmit={handleAddMemory} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Type persistent guidelines, absolute paths, or custom runtime instruction parameters..."
              className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-muted-foreground/40 font-medium"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-xs outline-none transition-all font-bold text-muted-foreground cursor-pointer"
            >
              <option value="Workspace">Workspace</option>
              <option value="Guidelines">Guidelines</option>
              <option value="Preferences">Preferences</option>
              <option value="Context">Context</option>
            </select>
            <button
              type="submit"
              disabled={!newContent.trim()}
              className="bg-primary text-primary-foreground font-bold text-xs px-6 py-3 rounded-xl hover:opacity-95 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Database className="w-3 h-3" /> Add Vector
            </button>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-green-500 font-bold flex items-center gap-1.5 pt-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Memory embedded successfully into local RAG layers.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Control Bar: Search & Tag Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={15} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search semantic dimensions..." 
            className="w-full h-10 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-xl pl-9 pr-4 text-xs outline-none transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto justify-end">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Embeddings Cluster Grid */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredMemories.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground/50 border border-dashed border-black/5 dark:border-white/5 rounded-2xl text-xs font-medium"
            >
              No matching semantic embedding entries mapped for this view.
            </motion.div>
          ) : (
            filteredMemories.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="premium-glass p-4 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-4 group hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Layers size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground/90 truncate">{m.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] bg-secondary text-secondary-foreground font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">
                        {m.category}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 font-mono">
                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[8px] text-muted-foreground/30 font-mono">
                        • {m.vectors} dim
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMemory(m.id)}
                  className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center flex-shrink-0"
                  title="Purge Embedding"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Real-Time Background Synchronization HUD */}
      <div className="premium-glass p-6 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-5 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Background Neural Context Pipeline</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            Ingesting file paths and vector space updates asynchronously to maximize inference latency precision.
          </p>
          <div className="w-full max-w-md h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden mt-2.5">
            <div className="w-5/6 h-full bg-primary animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
