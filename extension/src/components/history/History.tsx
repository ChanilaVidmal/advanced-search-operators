import { useMemo, useState } from 'react';
import { History as HistoryIcon, Pin, Star, Trash2, FileSymlink, BarChart3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStorage } from '@/hooks/useStorage';
import type { HistoryEntry, OperatorBlock } from '@/types/operator';

export function History() {
  const [history, setHistory] = useStorage<HistoryEntry[]>('history', []);
  const [search, setSearch] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState('');

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const sorted = useMemo(
    () =>
      [...history].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }),
    [history]
  );

  const filtered = search
    ? sorted.filter((h) => h.query.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const handleTogglePin = (id: string) => {
    setHistory(history.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h)));
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(history.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h)));
  };

  const handleDelete = (id: string) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  const handleLoad = (entry: HistoryEntry) => {
    const blocks: OperatorBlock[] = entry.operators.map((op) => ({
      ...op,
      operatorData: undefined,
    }));
    const hasChrome = typeof chrome !== 'undefined' && chrome.storage?.sync;
    if (hasChrome) {
      chrome.storage.sync.set({ builderBlocks: blocks });
    }
    localStorage.setItem('builderBlocks', JSON.stringify(blocks));
    notify(`Loaded — switch to Builder`);
  };

  const handleClearAll = () => {
    setHistory([]);
    notify('History cleared');
  };

  // ---- Statistics ----
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const today = new Date().toDateString();
    const todayCount = history.filter((h) => new Date(h.timestamp).toDateString() === today).length;
    const opFreq = new Map<string, number>();
    for (const h of history) {
      for (const op of h.operators) {
        const key = op.operator;
        opFreq.set(key, (opFreq.get(key) || 0) + 1);
      }
    }
    const topOps = [...opFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total: history.length, todayCount, topOps };
  }, [history]);

  return (
    <div className="flex h-full flex-col">
      {notification && (
        <div className="absolute top-0 left-0 right-0 z-10 mx-3 mt-2 rounded-lg border bg-primary px-3 py-2 text-sm text-primary-foreground shadow-lg">
          {notification}
        </div>
      )}

      {/* Search */}
      <div className="border-b p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history..."
        />
      </div>

      {/* Statistics toggle */}
      {stats && (
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-xs text-muted-foreground hover:bg-accent/50 border-b"
          onClick={() => setShowStats(!showStats)}
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Statistics
          </span>
          <span>{stats.total} total · {stats.todayCount} today</span>
        </button>
      )}

      {showStats && stats && (
        <div className="border-b bg-muted/30 p-3 space-y-2">
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Total searches</span>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Today</span>
              <p className="text-lg font-semibold">{stats.todayCount}</p>
            </div>
          </div>
          {stats.topOps.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Top operators</p>
              <div className="flex flex-wrap gap-1">
                {stats.topOps.map(([op, count]) => (
                  <span key={op} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                    {op} <span className="text-muted-foreground">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <HistoryIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No search history yet</p>
            <p className="text-xs mt-1">Searches will appear here after you use the builder</p>
          </div>
        ) : (
          filtered.map((entry) => (
            <div key={entry.id} className="p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {entry.pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                    {entry.favorite && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    )}
                    <code className="text-sm font-mono truncate">{entry.query}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  {entry.operators.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.operators.map((op) => (
                        <code key={op.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                          {op.operator}{op.value}
                        </code>
                      ))}
                    </div>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLoad(entry)} title="Load into Builder">
                    <FileSymlink className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePin(entry.id)}>
                    <Pin className={`h-3.5 w-3.5 ${entry.pinned ? 'text-primary' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleFavorite(entry.id)}>
                    <Star className={`h-3.5 w-3.5 ${entry.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom bar */}
      {history.length > 0 && (
        <div className="border-t p-3">
          <Button variant="outline" className="w-full text-xs" onClick={handleClearAll}>
            <RotateCcw className="h-4 w-4 mr-2" /> Clear All History
          </Button>
        </div>
      )}
    </div>
  );
}