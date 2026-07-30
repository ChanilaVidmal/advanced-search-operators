import { useState } from 'react';
import { FolderOpen, Plus, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStorage } from '@/hooks/useStorage';
import { Template } from '@/types/operator';

const builtInTemplates: Template[] = [
  {
    id: 'osint',
    name: 'OSINT Search',
    description: 'Open source intelligence gathering',
    operators: [
      { id: '1', operator: 'site:', value: '' },
      { id: '2', operator: 'filetype:', value: 'pdf' },
      { id: '3', operator: 'intitle:', value: '' },
    ],
    tags: ['osint', 'intelligence'],
    builtin: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'research',
    name: 'Research Papers',
    description: 'Find academic research papers',
    operators: [
      { id: '1', operator: 'site:', value: 'scholar.google.com' },
      { id: '2', operator: 'filetype:', value: 'pdf' },
      { id: '3', operator: 'intitle:', value: 'research' },
    ],
    tags: ['research', 'academic'],
    builtin: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pdf-search',
    name: 'PDF Search',
    description: 'Search for PDF documents',
    operators: [
      { id: '1', operator: 'filetype:', value: 'pdf' },
      { id: '2', operator: 'intext:', value: '' },
    ],
    tags: ['pdf', 'documents'],
    builtin: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'bug-bounty',
    name: 'Bug Hunting',
    description: 'Bug bounty and vulnerability research',
    operators: [
      { id: '1', operator: 'site:', value: '' },
      { id: '2', operator: 'inurl:', value: 'admin' },
      { id: '3', operator: 'intitle:', value: 'login' },
    ],
    tags: ['security', 'bug-bounty'],
    builtin: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export function Templates() {
  const [templates, setTemplates] = useStorage<Template[]>('templates', []);
  const [search, setSearch] = useState('');

  const allTemplates = [...builtInTemplates, ...templates];
  const filtered = search
    ? allTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : allTemplates;

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <FolderOpen className="h-8 w-8 mb-2" />
            <p className="text-sm">No templates found</p>
          </div>
        ) : (
          filtered.map((template) => (
            <div key={template.id} className="p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{template.name}</span>
                    {template.builtin && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        built-in
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {template.operators.map((op) => (
                      <code
                        key={op.id}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono"
                      >
                        {op.operator}
                        {op.value}
                      </code>
                    ))}
                  </div>
                </div>
                {!template.builtin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-3 flex gap-2">
        <Button variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" /> Import
        </Button>
        <Button variant="outline" className="flex-1">
          <Upload className="h-4 w-4 mr-2" /> Export
        </Button>
        <Button className="flex-1">
          <Plus className="h-4 w-4 mr-2" /> New
        </Button>
      </div>
    </div>
  );
}