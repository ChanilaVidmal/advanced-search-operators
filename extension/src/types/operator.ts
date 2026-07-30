export interface Operator {
  id: string;
  operator: string;
  name: string;
  description: string;
  syntax: string;
  example: string;
  category: OperatorCategory;
  status: OperatorStatus;
  engine: string[];
  docs?: string;
  aliases?: string[];
}

export type OperatorCategory =
  | 'basic'
  | 'domain'
  | 'files'
  | 'time'
  | 'url'
  | 'title'
  | 'content'
  | 'news'
  | 'boolean'
  | 'math'
  | 'deprecated';

export type OperatorStatus = 'supported' | 'limited' | 'deprecated';

export interface OperatorBlock {
  id: string;
  operator: string;
  value: string;
  operatorData?: Operator;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  operators: OperatorBlock[];
  tags: string[];
  builtin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  query: string;
  operators: OperatorBlock[];
  timestamp: string;
  pinned: boolean;
  favorite: boolean;
  tags: string[];
}

export interface SearchEngine {
  id: string;
  name: string;
  baseUrl: string;
  icon: string;
  operators: string[];
}

export const CATEGORY_LABELS: Record<OperatorCategory, string> = {
  basic: 'Basic',
  domain: 'Domain & Site',
  files: 'File Types',
  time: 'Time & Date',
  url: 'URL',
  title: 'Page Title',
  content: 'Page Content',
  news: 'News',
  boolean: 'Boolean & Syntax',
  math: 'Math & Numbers',
  deprecated: 'Deprecated',
};

export const STATUS_LABELS: Record<OperatorStatus, string> = {
  supported: 'Supported',
  limited: 'Limited Support',
  deprecated: 'Deprecated',
};