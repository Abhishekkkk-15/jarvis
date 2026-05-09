import React from 'react';
import { Play, Plus, Zap } from 'lucide-react';

const WORKFLOWS = [
  { id: '1', name: 'Morning Routine', description: 'Opens calendar, email, and news', status: 'ready' },
  { id: '2', name: 'Log Analysis', description: 'Downloads logs and summarizes errors', status: 'ready' },
  { id: '3', name: 'System Cleanup', description: 'Clears temp files and optimizes memory', status: 'running' },
];

export const WorkflowsScreen = () => {
  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:3001/workflows')
      .then(res => res.json())
      .then(data => {
        setWorkflows(data);
        setLoading(false);
      });
  }, []);
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">Automate complex tasks with multi-step agents.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium shadow-lg shadow-primary/20">
          <Plus size={18} />
          New Workflow
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground glass rounded-xl border-dashed border-2">No workflows found. Create one to get started!</div>
        ) : (
          workflows.map((w) => (
            <div key={w.id} className="glass p-6 rounded-xl group hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{w.name}</h3>
                  <p className="text-sm text-muted-foreground">{w.description}</p>
                </div>
              </div>
              <button className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-white transition-all">
                <Play size={18} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${w.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{w.status}</span>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};
