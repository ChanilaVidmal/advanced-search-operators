import { useState } from 'react';
import { Plus, Trash2, Copy, ExternalLink, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { operators } from '@/data/operators';
import { Operator, OperatorBlock } from '@/types/operator';

export function SearchBuilder() {
  const [blocks, setBlocks] = useState<OperatorBlock[]>([]);
  const [showOperatorPicker, setShowOperatorPicker] = useState(false);

  const addBlock = (op: Operator) => {
    setBlocks([
      ...blocks,
      {
        id: crypto.randomUUID() as string,
        operator: op.operator,
        value: '',
        operatorData: op,
      },
    ]);
    setShowOperatorPicker(false);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const updateValue = (id: string, value: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, value } : b)));
  };

  const moveBlock = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, removed);
    setBlocks(newBlocks);
  };

  const query = blocks.map((b) => (b.value ? `${b.operator}${b.value}` : b.operator)).join(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
  };

  const handleSearch = () => {
    chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(query)}` });
  };

  const addedOperatorIds = new Set(blocks.map((b) => b.operatorData?.id));
  const availableOperators = operators.filter((op) => !addedOperatorIds.has(op.id));

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm mb-4">No operators added yet</p>
            <Button onClick={() => setShowOperatorPicker(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Operator
            </Button>
          </div>
        )}

        {blocks.map((block, index) => (
          <div key={block.id} className="flex items-center gap-2 rounded-lg border bg-card p-2">
            <button className="cursor-grab text-muted-foreground hover:text-foreground" title="Drag to reorder">
              <GripVertical className="h-4 w-4" />
            </button>
            <code className="rounded bg-muted px-2 py-1 text-sm font-mono text-primary shrink-0">
              {block.operator}
            </code>
            <Input
              value={block.value}
              onChange={(e) => updateValue(block.id, e.target.value)}
              placeholder={block.operatorData?.syntax?.replace(block.operator, '') || 'Enter value...'}
              className="flex-1 h-8 text-sm"
            />
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => moveBlock(index, 'up')}>↑</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 'down')}>↓</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeBlock(block.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t bg-card p-3 space-y-3">
        {blocks.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-background px-3 py-2 font-mono text-sm">
              {query || <span className="text-muted-foreground">Query preview...</span>}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleSearch}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showOperatorPicker && (
          <div className="rounded-lg border bg-card max-h-48 overflow-y-auto">
            {availableOperators.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">All operators added</p>
            ) : (
              availableOperators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => addBlock(op)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                >
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary">{op.operator}</code>
                  <span className="text-foreground">{op.name}</span>
                </button>
              ))
            )}
          </div>
        )}

        <Button className="w-full" variant="outline" onClick={() => setShowOperatorPicker(!showOperatorPicker)}>
          <Plus className="h-4 w-4 mr-2" /> Add Operator
        </Button>
      </div>
    </div>
  );
}