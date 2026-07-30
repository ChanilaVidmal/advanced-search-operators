import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOperatorById } from '@/data/operators';

interface RecentlyViewedProps {
  recentlyViewed: string[];
  onSelect: (id: string) => void;
}

export function RecentlyViewed({ recentlyViewed, onSelect }: RecentlyViewedProps) {
  if (recentlyViewed.length === 0) return null;

  const items = recentlyViewed
    .map((id) => ({ id, op: getOperatorById(id) }))
    .filter((item) => item.op !== undefined);

  if (items.length === 0) return null;

  return (
    <div className="border-t">
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Recently Viewed</span>
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {items.map(({ id, op }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            className="h-7 text-xs font-mono"
            onClick={() => onSelect(id)}
          >
            {op!.operator}
          </Button>
        ))}
      </div>
    </div>
  );
}