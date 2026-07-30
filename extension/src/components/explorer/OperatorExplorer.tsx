import { useState, useMemo } from 'react';
import { Search, Copy, Star, ChevronDown, SortAsc, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/Dialog';
import { OperatorDetail } from './OperatorDetail';
import { RecentlyViewed } from './RecentlyViewed';
import { operators, searchOperators, getCategoriesWithCount } from '@/data/operators';
import { useStorage } from '@/hooks/useStorage';
import { CATEGORY_LABELS, type OperatorCategory, type OperatorStatus } from '@/types/operator';
import type { Operator } from '@/types/operator';

const categories = getCategoriesWithCount();

type SortKey = 'name' | 'category' | 'operator';
type StatusFilter = OperatorStatus | 'all';

export function OperatorExplorer() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<OperatorCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [favorites, setFavorites] = useStorage<string[]>('favorites', []);
  const [recentlyViewed, setRecentlyViewed] = useStorage<string[]>('recentlyViewed', []);
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);

  const filtered = useMemo(() => {
    let result = query ? searchOperators(query) : operators;

    if (category !== 'all') {
      result = result.filter((op) => op.category === category);
    }

    if (statusFilter !== 'all') {
      result = result.filter((op) => op.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name);
        case 'operator': return a.operator.localeCompare(b.operator);
        case 'category': return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [query, category, statusFilter, sortKey]);

  const visibleCategories = categories.slice(0, 5);
  const moreCategories = categories.slice(5);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleView = (op: Operator) => {
    setSelectedOp(op);
    setRecentlyViewed((prev: string[]) => {
      const updated = [op.id, ...prev.filter((v) => v !== op.id)].slice(0, 10);
      return updated;
    });
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'operator', label: 'Operator' },
    { key: 'category', label: 'Category' },
  ];

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'supported', label: 'Supported' },
    { key: 'limited', label: 'Limited' },
    { key: 'deprecated', label: 'Deprecated' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Search and filters */}
      <div className="border-b p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${operators.length} operators...`}
            className="pl-8"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All ({operators.length})
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setCategory(cat.category)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat.category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {CATEGORY_LABELS[cat.category as OperatorCategory] || cat.label} ({cat.count})
            </button>
          ))}
          {moreCategories.length > 0 && (
            <div className="relative group">
              <button className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                More <ChevronDown className="inline h-3 w-3" />
              </button>
              <div className="absolute right-0 top-full z-10 mt-1 hidden w-48 rounded-lg border bg-card shadow-lg group-hover:block">
                {moreCategories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setCategory(cat.category)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                  >
                    <span>{CATEGORY_LABELS[cat.category as OperatorCategory] || cat.label}</span>
                    <span className="text-xs text-muted-foreground">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status filter and sort row */}
        <div className="flex items-center gap-2 pt-0.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  statusFilter === opt.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent text-xs text-muted-foreground border-none outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Search className="h-8 w-8 mb-2" />
            <p className="text-sm">No operators found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((op) => (
              <div
                key={op.id}
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleView(op)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-primary">
                        {op.operator}
                      </code>
                      <span className="text-sm font-medium text-foreground truncate">
                        {op.name}
                      </span>
                      {op.status === 'deprecated' && (
                        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                          deprecated
                        </span>
                      )}
                      {op.status === 'limited' && (
                        <span className="rounded bg-yellow-100 dark:bg-yellow-900/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 dark:text-yellow-200">
                          limited
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{op.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-[11px] text-muted-foreground/70 font-mono">{op.syntax}</code>
                      {op.aliases && op.aliases.length > 0 && (
                        <span className="text-[10px] text-muted-foreground/50">
                          aliases: {op.aliases.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleCopy(op.operator); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleToggleFavorite(op.id); }}>
                      <Star className={`h-3.5 w-3.5 ${favorites.includes(op.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed recentlyViewed={recentlyViewed} onSelect={(id) => {
        const op = operators.find((o) => o.id === id);
        if (op) handleView(op);
      }} />

      {/* Operator Detail Dialog */}
      {selectedOp && (
        <Dialog open={true} onClose={() => setSelectedOp(null)} title={selectedOp.operator}>
          <OperatorDetail operator={selectedOp} onCopy={handleCopy} />
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" size="sm" onClick={() => {
              handleCopy(selectedOp.operator);
            }}>
              <Copy className="h-4 w-4 mr-2" /> Copy Operator
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
              handleToggleFavorite(selectedOp.id);
            }}>
              <Star className={`h-4 w-4 mr-2 ${favorites.includes(selectedOp.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {favorites.includes(selectedOp.id) ? 'Favorited' : 'Favorite'}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}