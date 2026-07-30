import { useState } from 'react';
import { History as HistoryIcon, Pin, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStorage } from '@/hooks/useStorage';
import { HistoryEntry } from '@/types/operator';

export function History() {
  const [history, setHistory] = useStorage<HistoryEntry[]>('history', []);
  const [search, setSearch] = useState('');

  const sorted = [...history].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filtered = search
    ? sorted.filter((h) => h.query.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const handleTogglePin = (id: string) => {
    setHistory(
      history.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h))
    );
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(
      history.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h))
    );
  };

  const handleDelete = (id: string) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history..."
        />
      </div>

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
                    {entry.pinned && <Pin className="h-3 w-3 text-primary" />}
                    {entry.favorite && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                    <code className="text-sm font-mono truncate">{entry.query}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleTogglePin(entry.id)}
                  >
                    <Pin
                      className={`h-3.5 w-3.5 ${
                        entry.pinned ? 'text-primary' : ''
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleToggleFavorite(entry.id)}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        entry.favorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : ''
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}