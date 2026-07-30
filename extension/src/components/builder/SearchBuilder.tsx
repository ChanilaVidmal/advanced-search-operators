import { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Copy, ExternalLink, GripVertical, FileSymlink, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { Dialog } from '@/components/ui/Dialog';
import { operators, searchOperators } from '@/data/operators';
import { engines, defaultEngineId, getEngine, getEngineSearchUrl } from '@/data/engines';
import { useStorage } from '@/hooks/useStorage';
import { validateQuery } from '@/search/validator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Operator, OperatorBlock, Template, HistoryEntry } from '@/types/operator';

function SortableBlock({ block, onUpdateValue, onRemove, onDuplicate, incompatible }: {
  block: OperatorBlock;
  onUpdateValue: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  incompatible?: boolean;
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
      <code className={`rounded px-2 py-1 text-sm font-mono shrink-0 ${incompatible ? 'bg-destructive/10 text-destructive line-through' : 'bg-muted text-primary'}`}>
        {block.operator}
        {incompatible && <span className="ml-1 text-[10px] not-italic" title="Not supported by current engine">!</span>}
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

function useQueryValidation(query: string) {
  return useMemo(() => validateQuery(query), [query]);
}

export function SearchBuilder() {
  const [blocks, setBlocks] = useStorage<OperatorBlock[]>('builderBlocks', []);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [engineId, setEngineId] = useStorage<string>('searchEngine', defaultEngineId);
  const safeEngineId = useMemo(() => {
    const found = engines.find((e) => e.id === engineId);
    return found ? engineId : defaultEngineId;
  }, [engineId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const query = useMemo(
    () => blocks.map((b) => (b.value ? `${b.operator}${b.value}` : b.operator)).join(' '),
    [blocks]
  );

  const { issues: validationIssues, valid: queryValid } = useQueryValidation(query);

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
    const url = getEngineSearchUrl(safeEngineId, query);
    chrome.tabs.create({ url });
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      query,
      operators: blocks,
      timestamp: new Date().toISOString(),
      pinned: false,
      favorite: false,
      tags: [],
    };
    const hasChrome = typeof chrome !== 'undefined' && chrome.storage?.sync;
    if (hasChrome) {
      chrome.storage.sync.get(['history'], (result: Record<string, unknown>) => {
        const existing = (result.history as HistoryEntry[]) || [];
        chrome.storage.sync.set({ history: [entry, ...existing].slice(0, 200) });
      });
    } else {
      const existing: HistoryEntry[] = JSON.parse(localStorage.getItem('history') || '[]');
      localStorage.setItem('history', JSON.stringify([entry, ...existing].slice(0, 200)));
    }
  }, [query, blocks, safeEngineId]);

  const handleClear = useCallback(() => {
    setBlocks([]);
  }, [setBlocks]);

  const [saveDialog, setSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const [, setTemplates] = useStorage<Template[]>('templates', []);

  const handleSaveTemplate = useCallback(() => {
    if (!saveName.trim()) return;
    const now = new Date().toISOString();
    const tpl: Template = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      description: saveDesc.trim(),
      operators: blocks.map((b) => ({ ...b })),
      tags: saveTags.split(',').map((s) => s.trim()).filter(Boolean),
      builtin: false,
      createdAt: now,
      updatedAt: now,
    };
    setTemplates((prev) => [...prev, tpl]);
    setSaveDialog(false);
    setSaveName('');
    setSaveDesc('');
    setSaveTags('');
  }, [saveName, saveDesc, saveTags, blocks, setTemplates]);

  const engineCategories = useMemo(() => getEngine(safeEngineId).categories, [safeEngineId]);

  const availableOperators = useMemo(() => {
    const filtered = operators.filter((op) => engineCategories.includes(op.category));
    return pickerSearch ? searchOperators(pickerSearch).filter((op) => engineCategories.includes(op.category)) : filtered;
  }, [pickerSearch, engineCategories]);



  return (
    <div className="flex h-full flex-col">
      {/* Engine selector */}
      <div className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground shrink-0">Search Engine</label>
          <select
            value={safeEngineId}
            onChange={(e) => setEngineId(e.target.value)}
            className="flex-1 h-7 rounded-md border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {engines.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                incompatible={block.operatorData ? !engineCategories.includes(block.operatorData.category) : false}
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
            <Button size="icon" onClick={handleSearch} title="Search Google" disabled={!queryValid}>
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
            <>
              <Button variant="outline" onClick={() => { setSaveName(''); setSaveDesc(''); setSaveTags(''); setSaveDialog(true); }} title="Save as template">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleClear}>
                Clear All
              </Button>
            </>
          )}
        </div>

        {/* Block count */}
        {blocks.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} · Drag to reorder
          </p>
        )}

        <Dialog open={saveDialog} onClose={() => setSaveDialog(false)} title="Save as Template">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="My Search Template" autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Input value={saveDesc} onChange={(e) => setSaveDesc(e.target.value)} placeholder="What this template does..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (comma-separated)</label>
              <Input value={saveTags} onChange={(e) => setSaveTags(e.target.value)} placeholder="osint, research, pdf" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSaveDialog(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveTemplate} disabled={!saveName.trim()}>Save</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}