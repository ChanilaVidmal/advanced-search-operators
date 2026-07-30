import type { Operator } from '@/types/operator';

export const titleOperators: Operator[] = [
  {
    id: 'intitle',
    operator: 'intitle:',
    name: 'In Title',
    description: 'Find pages with a specific word in the HTML title.',
    syntax: 'intitle:keyword',
    example: 'intitle:typescript tutorial',
    category: 'title',
    status: 'supported',
    engine: ['google', 'bing', 'duckduckgo'],
  },
  {
    id: 'allintitle',
    operator: 'allintitle:',
    name: 'All In Title',
    description: 'Find pages with all specified words in the HTML title.',
    syntax: 'allintitle:word1 word2',
    example: 'allintitle:react typescript guide',
    category: 'title',
    status: 'supported',
    engine: ['google', 'bing'],
  },
  {
    id: 'intitle_quotes',
    operator: 'intitle:"phrase"',
    name: 'Exact Phrase in Title',
    description: 'Find pages with an exact phrase in the title.',
    syntax: 'intitle:"exact phrase"',
    example: 'intitle:"machine learning"',
    category: 'title',
    status: 'supported',
    engine: ['google'],
  },
];