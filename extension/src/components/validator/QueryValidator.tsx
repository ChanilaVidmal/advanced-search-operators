import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateQuery, type ValidationIssue, type Token } from '@/search/validator';
import { cn } from '@/lib/utils';

const RULE_LABELS: Record<string, string> = {
  'unknown-operator': 'Unknown Operator',
  'deprecated-operator': 'Deprecated Operator',
  'duplicate-operator': 'Duplicate Operator',
  'missing-quotes': 'Missing Quotes',
  'missing-value': 'Missing Value',
  'unclosed-quotes': 'Unclosed Quotes',
};

export function QueryValidator() {
  const [query, setQuery] = useState('');

  const result = useMemo(() => validateQuery(query), [query]);

  const errorCount = result.issues.filter((i) => i.type === 'error').length;
  const warningCount = result.issues.filter((i) => i.type === 'warning').length;

  return (
    <div className="flex h-full flex-col">
      {/* Input */}
      <div className="border-b p-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
          Paste a search query to validate
        </label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="site:github.com filetype:pdf react tutorial"
          className="font-mono text-sm"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <RefreshCw className="h-8 w-8 mb-2" />
            <p className="text-sm">Enter a query above to validate it</p>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {/* Summary */}
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                {result.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className={`text-sm font-medium ${result.valid ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {result.valid ? 'Query looks valid' : 'Issues found'}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{result.tokens.length} tokens</span>
                {errorCount > 0 && <span className="text-destructive">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
                {warningCount > 0 && <span className="text-yellow-600 dark:text-yellow-400">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>}
              </div>
            </div>

            {/* Highlighted query */}
            <HighlightedQuery query={query} tokens={result.tokens} issues={result.issues} />

            {/* Issues list */}
            {result.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Issues ({result.issues.length})
                </h3>
                {result.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} onApply={(fix) => {
                    if (issue.token && issue.fix) {
                      const { start, end } = issue.token;
                      const fixVal = fix.replace(/^Did you mean /, '').replace(/["']/g, '');
                      setQuery(query.slice(0, start) + fixVal + query.slice(end));
                    }
                  }} />
                ))}
              </div>
            )}

            {result.issues.filter((i) => i.fix && i.token).length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const fixable = result.issues.find((i) => i.fix && i.token);
                  if (!fixable || !fixable.token || !fixable.fix) return;
                  const { start, end } = fixable.token;
                  const before = query.slice(0, start);
                  const after = query.slice(end);
                  const fixVal = fixable.fix.replace(/^Did you mean /, '').replace(/["']/g, '');
                  setQuery(`${before}${fixVal}${after}`);
                }}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Apply first fix
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightedQuery({ query, tokens, issues }: { query: string; tokens: Token[]; issues: ValidationIssue[] }) {
  if (!query.trim()) return null;

  const issueStarts = new Set(issues.filter((i) => i.token).map((i) => i.token!.start));
  const getIssueClass = (token: Token) => {
    return issueStarts.has(token.start) ? 'text-destructive bg-destructive/10' : 'text-primary';
  };

  return (
    <div className="rounded-lg border bg-card p-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parsed Query</h4>
      <div className="font-mono text-sm leading-relaxed break-all">
        {tokens.length === 0 ? (
          <span className="text-muted-foreground">{query}</span>
        ) : (
            tokens.map((token, i) => {
            let color = '';
            switch (token.type) {
              case 'operator':
                color = getIssueClass(token);
                break;
              case 'quotes':
                color = 'text-green-600 dark:text-green-400';
                break;
              case 'value':
                color = 'text-foreground';
                break;
              default:
                color = 'text-muted-foreground';
            }
            return (
              <span
                key={i}
                className={cn('rounded px-0.5', color)}
                title={`${token.type}: ${token.value}`}
              >
                {token.value}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue, onApply }: { issue: ValidationIssue; onApply?: (fix: string) => void }) {
  const [applied, setApplied] = useState(false);

  const handleClick = () => {
    if (issue.fix) {
      setApplied(true);
      if (issue.token && onApply) {
        onApply(issue.fix);
      }
    }
  };

  return (
    <div className={cn(
      'rounded-lg border p-3 transition-colors',
      issue.type === 'error'
        ? 'border-destructive/20 bg-destructive/5'
        : 'border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10'
    )}>
      <div className="flex items-start gap-2">
        {issue.type === 'error' ? (
          <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs font-medium',
              issue.type === 'error' ? 'text-destructive' : 'text-yellow-800 dark:text-yellow-200'
            )}>
              {RULE_LABELS[issue.rule] || issue.rule}
            </span>
          </div>
          <p className="text-sm mt-0.5">{issue.message}</p>
          {issue.fix && !applied && (
            <button
              className="mt-1.5 text-xs text-primary hover:underline inline-flex items-center gap-1"
              onClick={handleClick}
            >
              <Lightbulb className="h-3 w-3" />
              {issue.fix}
            </button>
          )}
          {applied && (
            <span className="mt-1.5 text-xs text-green-600 dark:text-green-400 inline-flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Fix applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
}