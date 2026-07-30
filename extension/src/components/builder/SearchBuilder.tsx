import { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Copy, ExternalLink, GripVertical, FileSymlink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { operators, searchOperators } from '@/data/operators';
import { useStorage } from '@/hooks/useStorage';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Operator, OperatorBlock } from '@/types/operator';


interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  blockId?: string;
}

function SortableBlock({ block, onUpdateValue, onRemove, onDuplicate }: {
  block: OperatorBlock;
  onUpdateValue: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg border bg-card p-2">
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <code className="rounded bg-muted px-2 py-1 text-sm font-mono text-primary shrink-0">
        {block.operator}
      </code>
      <Input
        value={block.value}
        onChange={(e) => onUpdateValue(block.id, e.target.value)}
        placeholder={block.operatorData?.syntax?.replace(block.operator, '').replace(/[{}]/g, '') || 'value'}
        className="flex-1 h-8 text-sm"
      />
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(block.id)} title="Duplicate">
          <FileSymlink className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemove(block.id)} title="Remove">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function validateBlocks(blocks: OperatorBlock[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (blocks.length === 0) return issues;

  const operatorCount = new Map<string, string[]>();
  for (const block of blocks) {
    const key = block.operator;
    if (!operatorCount.has(key)) operatorCount.set(key, []);
    operatorCount.get(key)!.push(block.id);
  }

  for (const [op, ids] of operatorCount) {
    if (ids.length > 1) {
      issues.push({
        type: 'warning',
        message: `Duplicate operator "${op}" used ${ids.length} times`,
        blockId: ids[0],
      });
    }
  }

  if (blocks.some((b) => b.operatorData?.status === 'deprecated')) {
    issues.push({
      type: 'warning',
      message: 'Query contains deprecated operator(s)',
    });
  }

  return issues;
}

export function SearchBuilder() {
  const [blocks, setBlocks] = useStorage<OperatorBlock[]>('builderBlocks', []);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const query = useMemo(
    () => blocks.map((b) => (b.value ? `${b.operator}${b.value}` : b.operator)).join(' '),
    [blocks]
  );

  const validationIssues = useMemo(() => validateBlocks(blocks), [blocks]);

  const addBlock = useCallback((op: Operator) => {
    setBlocks((prev: OperatorBlock[]) => [
      ...prev,
      {
        id: crypto.randomUUID() as string,
        operator: op.operator,
        value: '',
        operatorData: op,
      },
    ]);
    setShowPicker(false);
    setPickerSearch('');
  }, [setBlocks]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev: OperatorBlock[]) => prev.filter((b) => b.id !== id));
  }, [setBlocks]);

  const updateValue = useCallback((id: string, value: string) => {
    setBlocks((prev: OperatorBlock[]) =>
      prev.map((b) => (b.id === id ? { ...b, value } : b))
    );
  }, [setBlocks]);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev: OperatorBlock[]) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const source = prev[idx];
      const dup: OperatorBlock = {
        id: crypto.randomUUID() as string,
        operator: source.operator,
        value: source.value,
        operatorData: source.operatorData,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  }, [setBlocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev: OperatorBlock[]) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }, [setBlocks]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(query);
  }, [query]);

  const handleSearch = useCallback(() => {
    chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(query)}` });
  }, [query]);

  const handleClear = useCallback(() => {
    setBlocks([]);
  }, [setBlocks]);

  const availableOperators = useMemo(
    () => (pickerSearch ? searchOperators(pickerSearch) : operators),
    [pickerSearch]
  );

  const hasErrors = validationIssues.some((i) => i.type === 'error');

  return (
    <div className="flex h-full flex-col">
      {/* Validation bar */}
      {validationIssues.length > 0 && (
        <div className="border-b px-3 py-2 space-y-1">
          {validationIssues.map((issue, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-xs ${
              issue.type === 'error' ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {issue.type === 'error'
                ? <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                : <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              }
              {issue.message}
            </div>
          ))}
        </div>
      )}

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm mb-1">No operators added yet</p>
            <p className="text-xs mb-4">Click "Add Operator" to build your query</p>
            <Button onClick={() => setShowPicker(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Operator
            </Button>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onUpdateValue={updateValue}
                onRemove={removeBlock}
                onDuplicate={duplicateBlock}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Bottom bar */}
      <div className="border-t bg-card p-3 space-y-3">
        {/* Query preview */}
        {blocks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-background px-3 py-2 font-mono text-sm break-all">
              {query || <span className="text-muted-foreground">Query preview...</span>}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy} title="Copy query">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleSearch} title="Search Google" disabled={hasErrors}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Operator picker */}
        {showPicker && (
          <div className="rounded-lg border bg-card shadow-lg">
            <div className="p-2 border-b">
              <AutocompleteInput
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                onSelect={(op) => addBlock(op)}
                suggestions={availableOperators}
                placeholder="Search operators..."
                className="h-8 text-sm"
                showIcon={false}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant={showPicker ? 'secondary' : 'outline'}
            onClick={() => { setShowPicker(!showPicker); setPickerSearch(''); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Operator
          </Button>
          {blocks.length > 0 && (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleClear}>
              Clear All
            </Button>
          )}
        </div>

        {/* Block count */}
        {blocks.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} · Drag to reorder
          </p>
        )}
      </div>
    </div>
  );
}