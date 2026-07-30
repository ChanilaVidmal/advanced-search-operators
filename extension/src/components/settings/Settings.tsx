import { Sun, Moon, Keyboard, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useStorage } from '@/hooks/useStorage';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [searchEngine, setSearchEngine] = useStorage<string>('searchEngine', 'google');

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
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Search Engine
        </h2>
        <div className="mt-3">
          <select
            value={searchEngine}
            onChange={(e) => setSearchEngine(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </select>
        </div>
      </div>

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