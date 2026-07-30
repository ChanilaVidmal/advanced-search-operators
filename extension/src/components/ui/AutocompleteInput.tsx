import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Operator } from '@/types/operator';
import { CATEGORY_LABELS } from '@/types/operator';

interface AutocompleteInputProps extends Omit<InputProps, 'onSelect' | 'onChange' | 'value'> {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (operator: Operator) => void;
  suggestions: Operator[];
  onSearchChange?: (query: string) => void;
  showIcon?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  suggestions,
  onSearchChange,
  showIcon = true,
  className,
  placeholder = 'Type to search operators...',
  ...inputProps
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(e);
      setOpen(newValue.length > 0);
      setActiveIndex(-1);
      onSearchChange?.(newValue);
    },
    [onChange, onSearchChange]
  );

  const handleSelect = useCallback(
    (op: Operator) => {
      onSelect(op);
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            handleSelect(suggestions[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [open, suggestions, activeIndex, handleSelect]
  );

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-index]');
      const item = items[activeIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const grouped = suggestions.reduce<Record<string, Operator[]>>((acc: Record<string, Operator[]>, op: Operator) => {
    const cat = op.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(op);
    return acc;
  }, {});

  return (
    <div className="relative">
      <div className="relative">
        {showIcon && (
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => typeof value === 'string' && value.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          className={cn(showIcon && 'pl-8', className)}
          {...inputProps}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-card shadow-lg"
        >
          {Object.entries(grouped).map(([category, ops]) => (
            <div key={category}>
              <div className="sticky top-0 bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
              </div>
              {ops.map((op: Operator) => {
                const globalIndex = suggestions.indexOf(op);
                return (
                  <button
                    key={op.id}
                    data-index={globalIndex}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      globalIndex === activeIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(op);
                    }}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                  >
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary shrink-0">
                      {op.operator}
                    </code>
                    <span className="truncate">{op.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                      {op.status === 'deprecated' ? 'deprecated' : op.status === 'limited' ? 'limited' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}