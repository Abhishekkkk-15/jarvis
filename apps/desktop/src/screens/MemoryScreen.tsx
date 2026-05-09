import React from 'react';
import { Database, Search, Cpu } from 'lucide-react';

export const MemoryScreen = () => {
  const [memories, setMemories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // In production, we'd have a specific memories endpoint
    fetch('http://localhost:3001/history') // Fallback for now
      .then(res => res.json())
      .then(data => {
        setMemories(data.filter((m: any) => m.role === 'assistant').slice(0, 5));
        setLoading(false);
      });
  }, []);
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Long-term Memory</h1>
          <p className="text-muted-foreground mt-1">Jarvis learns from your interactions and local files.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center glass px-4 py-2 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Knowledge</div>
            <div className="text-xl font-bold">1,248</div>
          </div>
          <div className="text-center glass px-4 py-2 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Vector index</div>
            <div className="text-xl font-bold">Ready</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          placeholder="Search semantic memory..." 
          className="w-full h-12 bg-secondary/50 border rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground col-span-2">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground col-span-2 glass rounded-xl">No indexed memories yet.</div>
        ) : (
          memories.map((m) => (
            <div key={m.id} className="glass p-5 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Database size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm truncate">{m.content}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase">{m.role}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="glass p-8 rounded-2xl flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
        <Cpu className="text-primary" size={48} />
        <h3 className="text-lg font-bold">Neural Context Buffer</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Jarvis is currently processing your local files in the background to build a comprehensive knowledge graph.
        </p>
        <div className="w-full max-w-xs h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
};
