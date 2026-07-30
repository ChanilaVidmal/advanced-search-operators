import type { Operator } from '@/types/operator';

export const newsOperators: Operator[] = [
  {
    id: 'source',
    operator: 'source:',
    name: 'News Source',
    description: 'Search for news from a specific publication or source.',
    syntax: 'source:publication',
    example: 'source:bbc news',
    category: 'news',
    status: 'supported',
    engine: ['google'],
  },
  {
    id: 'location',
    operator: 'location:',
    name: 'News Location',
    description: 'Filter news results by geographic location.',
    syntax: 'location:city',
    example: 'location:london weather',
    category: 'news',
    status: 'supported',
    engine: ['google'],
  },
  {
    id: 'site_news',
    operator: 'site:news.*',
    name: 'News Site',
    description: 'Search within news domains.',
    syntax: 'site:news.* query',
    example: 'site:news.* technology',
    category: 'news',
    status: 'supported',
    engine: ['google'],
  },
];