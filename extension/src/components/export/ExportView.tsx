import { useMemo, useState, useRef, useEffect } from 'react';
import { Share2, ClipboardCopy, FileJson, FileText, Table, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/useStorage';
import { exportTemplatesJSON, exportTemplatesTXT, exportTemplatesMarkdown, exportTemplatesCSV,
         exportHistoryJSON, exportHistoryTXT, exportHistoryMarkdown, exportHistoryCSV,
         getShareURL, getShareableText } from '@/services/exportService';
import type { Template, HistoryEntry, OperatorBlock } from '@/types/operator';

type TabId = 'templates' | 'history' | 'share';
type Format = 'json' | 'txt' | 'md' | 'csv';

const tabs: { id: TabId; label: string }[] = [
  { id: 'templates', label: 'Templates' },
  { id: 'history', label: 'History' },
  { id: 'share', label: 'Share' },
];

export function ExportView() {
  const [templates] = useStorage<Template[]>('templates', []);
  const [history] = useStorage<HistoryEntry[]>('history', []);
  const [builderBlocks] = useStorage<OperatorBlock[]>('builderBlocks', []);
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'share'>('templates');
  const [notification, setNotification] = useState('');

  const query = useMemo(
    () => builderBlocks.map((b) => (b.value ? `${b.operator}${b.value}` : b.operator)).join(' '),
    [builderBlocks]
  );

  const notifyTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(notifyTimer.current), []);

  const notify = (msg: string) => {
    setNotification(msg);
    clearTimeout(notifyTimer.current);
    notifyTimer.current = setTimeout(() => setNotification(''), 2500);
  };

  const handleCopyShare = () => {
    const text = getShareableText(query, builderBlocks);
    navigator.clipboard.writeText(text);
    notify('Copied to clipboard');
  };

  const handleOpenSearch = () => {
    chrome.tabs.create({ url: getShareURL(query) });
  };

  const exportTemplate = (fmt: Format) => {
    const fn: Record<Format, (t: Template[]) => void> = {
      json: exportTemplatesJSON,
      txt: exportTemplatesTXT,
      md: exportTemplatesMarkdown,
      csv: exportTemplatesCSV,
    };
    fn[fmt](templates);
    notify(`Exported templates as ${fmt.toUpperCase()}`);
  };

  const exportHistory = (fmt: Format) => {
    const fn: Record<Format, (h: HistoryEntry[]) => void> = {
      json: exportHistoryJSON,
      txt: exportHistoryTXT,
      md: exportHistoryMarkdown,
      csv: exportHistoryCSV,
    };
    fn[fmt](history);
    notify(`Exported history as ${fmt.toUpperCase()}`);
  };

  return (
    <div className="flex h-full flex-col">
      {notification && (
        <div className="absolute top-0 left-0 right-0 z-10 mx-3 mt-2 rounded-lg border bg-primary px-3 py-2 text-sm text-primary-foreground shadow-lg">
          {notification}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b bg-card">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center px-2 py-2.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'templates' && (
          <>
            <p className="text-xs text-muted-foreground">
              Export your {templates.length} saved template{templates.length !== 1 ? 's' : ''}.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportTemplate('json')} disabled={templates.length === 0}>
                <FileJson className="h-5 w-5" /> <span className="text-xs">JSON</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportTemplate('txt')} disabled={templates.length === 0}>
                <FileText className="h-5 w-5" /> <span className="text-xs">Plain Text</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportTemplate('md')} disabled={templates.length === 0}>
                <FileText className="h-5 w-5" /> <span className="text-xs">Markdown</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportTemplate('csv')} disabled={templates.length === 0}>
                <Table className="h-5 w-5" /> <span className="text-xs">CSV</span>
              </Button>
            </div>
            {templates.length === 0 && <p className="text-xs text-muted-foreground text-center">No templates to export</p>}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <p className="text-xs text-muted-foreground">
              Export your {history.length} history entr{history.length !== 1 ? 'ies' : 'y'}.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportHistory('json')} disabled={history.length === 0}>
                <FileJson className="h-5 w-5" /> <span className="text-xs">JSON</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportHistory('txt')} disabled={history.length === 0}>
                <FileText className="h-5 w-5" /> <span className="text-xs">Plain Text</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportHistory('md')} disabled={history.length === 0}>
                <FileText className="h-5 w-5" /> <span className="text-xs">Markdown</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => exportHistory('csv')} disabled={history.length === 0}>
                <Table className="h-5 w-5" /> <span className="text-xs">CSV</span>
              </Button>
            </div>
            {history.length === 0 && <p className="text-xs text-muted-foreground text-center">No history to export</p>}
          </>
        )}

        {activeTab === 'share' && (
          <>
            <p className="text-xs text-muted-foreground">Share the current builder query.</p>
            {builderBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No query in builder</p>
                <p className="text-xs mt-1">Add operators in the Builder tab first</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border bg-card p-3">
                  <code className="text-sm font-mono break-all">{query}</code>
                </div>

                <Button variant="outline" className="w-full" onClick={handleCopyShare}>
                  <ClipboardCopy className="h-4 w-4 mr-2" /> Copy Shareable Text
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex-col gap-1 h-16" onClick={() => {
                    navigator.clipboard.writeText(getShareURL(query));
                    notify('URL copied to clipboard');
                  }}>
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs">Copy URL</span>
                  </Button>
                  <Button variant="outline" className="flex-col gap-1 h-16" onClick={handleOpenSearch}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-xs">Open in Google</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}