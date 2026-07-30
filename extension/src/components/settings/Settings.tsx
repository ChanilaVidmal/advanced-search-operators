import { Sun, Moon, Keyboard, Globe, Palette, History, Download } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useStorage } from '@/hooks/useStorage';
import { engines } from '@/data/engines';

export function Settings() {
  const { theme, themeLock, setThemeLock } = useTheme();
  const [searchEngine, setSearchEngine] = useStorage<string>('searchEngine', 'google');
  const [maxHistory, setMaxHistory] = useStorage<number>('maxHistory', 200);
  const [autoSaveHistory, setAutoSaveHistory] = useStorage<boolean>('autoSaveHistory', true);
  const [exportFormat, setExportFormat] = useStorage<string>('exportFormat', 'json');

  const shortcuts = [
    { keys: 'Ctrl+Shift+S', action: 'Open side panel' },
    { keys: 'Ctrl+Enter', action: 'Execute search' },
    { keys: 'Ctrl+C', action: 'Copy query' },
    { keys: 'Ctrl+N', action: 'New block' },
    { keys: 'Delete', action: 'Remove block' },
    { keys: '↑ / ↓', action: 'Navigate list' },
    { keys: 'Enter', action: 'Select item' },
    { keys: 'Escape', action: 'Close / cancel' },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Appearance */}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance
        </h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Theme</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={themeLock}
                onChange={(e) => setThemeLock(e.target.value as 'auto' | 'light' | 'dark')}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                <option value="auto">Auto (follow system)</option>
                <option value="light">Force light</option>
                <option value="dark">Force dark</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Engine */}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Default Search Engine
        </h2>
        <div className="mt-3">
          <select
            value={searchEngine}
            onChange={(e) => setSearchEngine(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {engines.map((eng) => (
              <option key={eng.id} value={eng.id}>{eng.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Used as default in the Builder. Can be changed per query.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          History
        </h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-save searches</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveHistory}
                onChange={(e) => setAutoSaveHistory(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Maximum entries ({maxHistory})
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={maxHistory}
              onChange={(e) => setMaxHistory(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Defaults
        </h2>
        <div className="mt-3">
          <label className="text-xs text-muted-foreground block mb-1">Default export format</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="json">JSON</option>
            <option value="txt">Plain Text</option>
            <option value="md">Markdown</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Keyboard className="h-4 w-4" />
          Keyboard Shortcuts
        </h2>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.keys} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}