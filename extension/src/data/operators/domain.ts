import type { Operator } from '@/types/operator';

export const domainOperators: Operator[] = [
  {
    id: 'site',
    operator: 'site:',
    name: 'Site Search',
    description: 'Search within a specific website or domain.',
    syntax: 'site:example.com',
    example: 'site:github.com react',
    category: 'domain',
    status: 'supported',
    engine: ['google', 'bing', 'duckduckgo'],
    docs: 'https://support.google.com/websearch/answer/2466433',
  },
  {
    id: 'site_tld',
    operator: 'site:.tld',
    name: 'Top-Level Domain',
    description: 'Search within all domains with a specific TLD.',
    syntax: 'site:.edu',
    example: 'site:.edu machine learning',
    category: 'domain',
    status: 'supported',
    engine: ['google'],
  },
  {
    id: 'related',
    operator: 'related:',
    name: 'Related Sites',
    description: 'Find websites related to a given domain.',
    syntax: 'related:example.com',
    example: 'related:github.com',
    category: 'domain',
    status: 'supported',
    engine: ['google'],
  },
];