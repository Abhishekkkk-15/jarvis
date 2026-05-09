import React from 'react';
import { Clock, MessageSquare, ChevronRight } from 'lucide-react';

export const HistoryScreen = () => {
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('http://localhost:3001/history')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error('Expected array from history API, got:', data);
          setError('Invalid data format received from server');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
        <p className="text-muted-foreground mt-1">Review your past conversations and automated tasks.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading history...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 glass rounded-xl border-red-500/20 border-2">
            <p className="font-semibold">Failed to load history</p>
            <p className="text-xs opacity-70 mt-1">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground glass rounded-xl border-dashed border-2">No activity history found.</div>
        ) : (
          history.map((h) => (
            <div key={h.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold truncate max-w-[400px]">{h.content}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{h.role}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          ))
        )}
      </div>

      <button className="w-full py-4 border-2 border-dashed border-muted rounded-xl text-sm text-muted-foreground hover:bg-secondary/50 transition-all font-medium">
        Load more history
      </button>
    </div>
  );
};
