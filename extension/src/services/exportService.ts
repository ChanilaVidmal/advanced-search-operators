import type { HistoryEntry, OperatorBlock, Template } from '@/types/operator';

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function blocksToText(operators: OperatorBlock[]): string {
  return operators.map((b) => (b.value ? `${b.operator}${b.value}` : b.operator)).join(' ');
}

function templateToText(t: Template): string {
  const lines = [
    `# ${t.name}`,
    `Description: ${t.description}`,
    `Tags: ${t.tags.join(', ') || '(none)'}`,
    `Query: ${blocksToText(t.operators)}`,
    '',
  ];
  return lines.join('\n');
}

function templateToMarkdown(t: Template): string {
  const lines = [
    `## ${t.name}`,
    `**Description:** ${t.description}`,
    `**Tags:** ${t.tags.join(', ') || '*none*'}`,
    `**Operators:**`,
    ...t.operators.map((o) => `  - \`${o.operator}${o.value}\``),
    '',
  ];
  return lines.join('\n');
}

function historyToText(h: HistoryEntry): string {
  const lines = [
    `Date: ${new Date(h.timestamp).toLocaleString()}`,
    `Query: ${h.query}`,
    `Pinned: ${h.pinned ? 'Yes' : 'No'}`,
    `Favorited: ${h.favorite ? 'Yes' : 'No'}`,
    `Tags: ${h.tags.join(', ') || '(none)'}`,
    '',
  ];
  return lines.join('\n');
}

function historyToMarkdown(h: HistoryEntry): string {
  const lines = [
    `### ${h.query}`,
    `**Date:** ${new Date(h.timestamp).toLocaleString()}`,
    `**Pinned:** ${h.pinned ? 'Yes' : 'No'} · **Favorited:** ${h.favorite ? 'Yes' : 'No'}`,
    `**Tags:** ${h.tags.join(', ') || '*none*'}`,
    '',
  ];
  return lines.join('\n');
}

function historyToCsvRow(h: HistoryEntry): string {
  const q = `"${h.query.replace(/"/g, '""')}"`;
  const ts = new Date(h.timestamp).toISOString();
  const tags = `"${h.tags.join('; ')}"`;
  return `${q},${ts},${h.pinned},${h.favorite},${tags}`;
}

// ---- Templates ----

export function exportTemplatesJSON(templates: Template[]) {
  const content = JSON.stringify(templates, null, 2);
  downloadBlob(content, 'templates.json', 'application/json');
}

export function exportTemplatesTXT(templates: Template[]) {
  const content = templates.map(templateToText).join('---\n');
  downloadBlob(content, 'templates.txt', 'text/plain');
}

export function exportTemplatesMarkdown(templates: Template[]) {
  const header = '# Search Operator Templates\n\n';
  const content = header + templates.map(templateToMarkdown).join('\n');
  downloadBlob(content, 'templates.md', 'text/markdown');
}

export function exportTemplatesCSV(templates: Template[]) {
  const rows = templates.map((t) => {
    const name = `"${t.name.replace(/"/g, '""')}"`;
    const desc = `"${t.description.replace(/"/g, '""')}"`;
    const tags = `"${t.tags.join('; ')}"`;
    const query = `"${blocksToText(t.operators).replace(/"/g, '""')}"`;
    return `${name},${desc},${tags},${query}`;
  });
  const header = 'name,description,tags,query';
  const content = [header, ...rows].join('\n');
  downloadBlob(content, 'templates.csv', 'text/csv');
}

// ---- History ----

export function exportHistoryJSON(history: HistoryEntry[]) {
  const content = JSON.stringify(history, null, 2);
  downloadBlob(content, 'history.json', 'application/json');
}

export function exportHistoryTXT(history: HistoryEntry[]) {
  const content = history.map(historyToText).join('---\n');
  downloadBlob(content, 'history.txt', 'text/plain');
}

export function exportHistoryMarkdown(history: HistoryEntry[]) {
  const header = '# Search History\n\n';
  const content = header + history.map(historyToMarkdown).join('\n');
  downloadBlob(content, 'history.md', 'text/markdown');
}

export function exportHistoryCSV(history: HistoryEntry[]) {
  const rows = history.map(historyToCsvRow);
  const header = 'query,timestamp,pinned,favorite,tags';
  const content = [header, ...rows].join('\n');
  downloadBlob(content, 'history.csv', 'text/csv');
}

// ---- Share URL ----

export function getShareURL(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function getShareableText(query: string, operators: OperatorBlock[]): string {
  const lines = [
    'Generated with Advanced Search Operators',
    '',
    `Query: ${query}`,
    '',
    'Operators:',
    ...operators.map((o) => `  ${o.operator}${o.value || '<value>'}`),
    '',
    getShareURL(query),
  ];
  return lines.join('\n');
}