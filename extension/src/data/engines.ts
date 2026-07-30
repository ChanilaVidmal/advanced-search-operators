import type { SearchEngine } from '@/types/operator';
import type { OperatorCategory } from '@/types/operator';

export interface EngineDefinition extends SearchEngine {
  searchUrl: string;
  categories: OperatorCategory[];
}

export const engines: EngineDefinition[] = [
  {
    id: 'google',
    name: 'Google',
    baseUrl: 'google.com',
    searchUrl: 'https://www.google.com/search?q=',
    icon: '🔍',
    operators: [],
    categories: ['basic', 'domain', 'files', 'time', 'url', 'title', 'content', 'news', 'boolean', 'math', 'deprecated'],
  },
  {
    id: 'bing',
    name: 'Bing',
    baseUrl: 'bing.com',
    searchUrl: 'https://www.bing.com/search?q=',
    icon: 'B',
    operators: [],
    categories: ['basic', 'domain', 'files', 'url', 'title', 'content', 'news', 'boolean'],
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    baseUrl: 'duckduckgo.com',
    searchUrl: 'https://duckduckgo.com/?q=',
    icon: 'D',
    operators: [],
    categories: ['basic', 'domain', 'files', 'url', 'title', 'content', 'news', 'boolean'],
  },
  {
    id: 'github',
    name: 'GitHub',
    baseUrl: 'github.com',
    searchUrl: 'https://github.com/search?q=',
    icon: 'G',
    operators: [],
    categories: ['basic', 'domain', 'files', 'url', 'content'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    baseUrl: 'gitlab.com',
    searchUrl: 'https://gitlab.com/search?search=',
    icon: 'G',
    operators: [],
    categories: ['basic', 'domain', 'files', 'content'],
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    baseUrl: 'stackoverflow.com',
    searchUrl: 'https://stackoverflow.com/search?q=',
    icon: 'S',
    operators: [],
    categories: ['basic', 'boolean', 'content'],
  },
  {
    id: 'reddit',
    name: 'Reddit',
    baseUrl: 'reddit.com',
    searchUrl: 'https://www.reddit.com/search/?q=',
    icon: 'R',
    operators: [],
    categories: ['basic', 'domain', 'url', 'title', 'content', 'boolean'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    baseUrl: 'youtube.com',
    searchUrl: 'https://www.youtube.com/results?search_query=',
    icon: 'Y',
    operators: [],
    categories: ['basic', 'content', 'time', 'boolean'],
  },
  {
    id: 'scholar',
    name: 'Google Scholar',
    baseUrl: 'scholar.google.com',
    searchUrl: 'https://scholar.google.com/scholar?q=',
    icon: 'S',
    operators: [],
    categories: ['basic', 'domain', 'files', 'time', 'boolean'],
  },
  {
    id: 'arxiv',
    name: 'Arxiv',
    baseUrl: 'arxiv.org',
    searchUrl: 'https://arxiv.org/search/?query=',
    icon: 'A',
    operators: [],
    categories: ['basic', 'content', 'time', 'boolean'],
  },
  {
    id: 'npm',
    name: 'NPM',
    baseUrl: 'npmjs.com',
    searchUrl: 'https://www.npmjs.com/search?q=',
    icon: 'N',
    operators: [],
    categories: ['basic', 'content'],
  },
  {
    id: 'pypi',
    name: 'PyPI',
    baseUrl: 'pypi.org',
    searchUrl: 'https://pypi.org/search/?q=',
    icon: 'P',
    operators: [],
    categories: ['basic', 'content'],
  },
  {
    id: 'docker',
    name: 'Docker Hub',
    baseUrl: 'hub.docker.com',
    searchUrl: 'https://hub.docker.com/search?q=',
    icon: 'D',
    operators: [],
    categories: ['basic', 'content'],
  },
];

export const defaultEngineId = 'google';

export function getEngine(id: string): EngineDefinition {
  return engines.find((e) => e.id === id) || engines[0];
}

export function getEngineSearchUrl(engineId: string, query: string): string {
  const engine = getEngine(engineId);
  return `${engine.searchUrl}${encodeURIComponent(query)}`;
}