import { Copy, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Operator } from '@/types/operator';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types/operator';

interface OperatorDetailProps {
  operator: Operator;
  onCopy: (text: string) => void;
}

export function OperatorDetail({ operator, onCopy }: OperatorDetailProps) {
  const op = operator;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-1 text-base font-mono text-primary">
            {op.operator}
          </code>
          <span className="text-base font-medium">{op.name}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {CATEGORY_LABELS[op.category]}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            op.status === 'deprecated'
              ? 'bg-destructive/10 text-destructive'
              : op.status === 'limited'
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
          }`}>
            {STATUS_LABELS[op.status]}
          </span>
          {op.engine.map((e) => (
            <span key={e} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</h4>
        <p className="text-sm">{op.description}</p>
      </div>

      {/* Syntax */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Syntax</h4>
        <code className="block rounded-md bg-muted px-3 py-2 text-sm font-mono">{op.syntax}</code>
      </div>

      {/* Example */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Example</h4>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">{op.example}</code>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => onCopy(op.example)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => {
            const url = `https://www.google.com/search?q=${encodeURIComponent(op.example)}`;
            chrome.tabs.create({ url });
          }}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Aliases */}
      {op.aliases && op.aliases.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Aliases</h4>
          <div className="flex flex-wrap gap-1.5">
            {op.aliases.map((alias) => (
              <code key={alias} className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{alias}</code>
            ))}
          </div>
        </div>
      )}

      {/* Docs */}
      {op.docs && (
        <div>
          <a
            href={op.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            View Documentation
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}