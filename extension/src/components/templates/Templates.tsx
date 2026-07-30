import { useState } from 'react';
import { FolderOpen, Plus, Trash2, Download, Upload, FileSymlink, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/Dialog';
import { useStorage } from '@/hooks/useStorage';
import type { Template, OperatorBlock } from '@/types/operator';

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
  const [builderBlocks] = useStorage<OperatorBlock[]>('builderBlocks', []);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');
  const [notification, setNotification] = useState('');

  const allTemplates = [...builtInTemplates, ...templates];
  const filtered = search
    ? allTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : allTemplates;

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setFormTags('');
    setDialog({ open: true });
  };

  const openEdit = (t: Template) => {
    setFormName(t.name);
    setFormDesc(t.description);
    setFormTags(t.tags.join(', '));
    setDialog({ open: true, editId: t.id });
  };

  const handleSaveDialog = () => {
    const now = new Date().toISOString();
    if (dialog.editId) {
      setTemplates(
        templates.map((t) =>
          t.id === dialog.editId
            ? { ...t, name: formName, description: formDesc, tags: formTags.split(',').map((s) => s.trim()).filter(Boolean), updatedAt: now }
            : t
        )
      );
      notify('Template updated');
    } else {
      const newTpl: Template = {
        id: crypto.randomUUID(),
        name: formName,
        description: formDesc,
        operators: builderBlocks.length > 0 ? builderBlocks.map((b) => ({ ...b })) : [{ id: crypto.randomUUID(), operator: 'site:', value: '' }],
        tags: formTags.split(',').map((s) => s.trim()).filter(Boolean),
        builtin: false,
        createdAt: now,
        updatedAt: now,
      };
      setTemplates([...templates, newTpl]);
      notify('Template created');
    }
    setDialog({ open: false });
  };

  const handleLoad = (tpl: Template) => {
    chrome.storage?.sync?.set({ builderBlocks: tpl.operators });
    localStorage.setItem('builderBlocks', JSON.stringify(tpl.operators));
    notify(`"${tpl.name}" loaded — switch to Builder`);
  };

  const handleExport = () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Exported templates');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result as string) as Template[];
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          const withIds = imported.map((t) => ({
            ...t,
            id: t.id || crypto.randomUUID(),
            builtin: false,
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setTemplates([...templates, ...withIds]);
          notify(`Imported ${withIds.length} template(s)`);
        } catch {
          notify('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Notification */}
      {notification && (
        <div className="absolute top-0 left-0 right-0 z-10 mx-3 mt-2 rounded-lg border bg-primary px-3 py-2 text-sm text-primary-foreground shadow-lg animate-in">
          {notification}
        </div>
      )}

      {/* Search */}
      <div className="border-b p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
        />
      </div>

      {/* List */}
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
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {template.tags.map((tag) => (
                        <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {template.operators.map((op) => (
                      <code key={op.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                        {op.operator}{op.value}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleLoad(template)}
                    title="Load into Builder"
                  >
                    <FileSymlink className="h-4 w-4" />
                  </Button>
                  {!template.builtin && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(template)}
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(template.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t p-3 flex gap-2">
        {builderBlocks.length > 0 && (
          <Button variant="outline" className="flex-1 text-xs" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Save Builder
          </Button>
        )}
        <Button variant="outline" className="flex-1 text-xs" onClick={handleImport}>
          <Download className="h-4 w-4 mr-1" /> Import
        </Button>
        <Button variant="outline" className="flex-1 text-xs" onClick={handleExport}>
          <Upload className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        title={dialog.editId ? 'Edit Template' : 'Save as Template'}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="My Search Template" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="What this template does..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (comma-separated)</label>
            <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="osint, research, pdf" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveDialog} disabled={!formName.trim()}>
              {dialog.editId ? 'Save' : 'Create Template'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}