import type { Operator, OperatorCategory } from '@/types/operator';
import { basicOperators } from './basic';
import { domainOperators } from './domain';
import { fileOperators } from './files';
import { timeOperators } from './time';
import { urlOperators } from './url';
import { titleOperators } from './title';
import { contentOperators } from './content';
import { newsOperators } from './news';
import { booleanOperators } from './boolean';
import { mathOperators } from './math';
import { deprecatedOperators } from './deprecated';

export type { Operator, OperatorCategory };

export const operators: Operator[] = [
  ...basicOperators,
  ...domainOperators,
  ...fileOperators,
  ...timeOperators,
  ...urlOperators,
  ...titleOperators,
  ...contentOperators,
  ...newsOperators,
  ...booleanOperators,
  ...mathOperators,
  ...deprecatedOperators,
];

export function getOperatorsByCategory(category: OperatorCategory): Operator[] {
  return operators.filter((op) => op.category === category);
}

export function getOperatorById(id: string): Operator | undefined {
  return operators.find((op) => op.id === id);
}

export function searchOperators(query: string): Operator[] {
  const q = query.toLowerCase();
  return operators.filter(
    (op) =>
      op.operator.toLowerCase().includes(q) ||
      op.name.toLowerCase().includes(q) ||
      op.description.toLowerCase().includes(q) ||
      op.syntax.toLowerCase().includes(q) ||
      op.aliases?.some((a) => a.toLowerCase().includes(q))
  );
}

export function getSupportedOperators(): Operator[] {
  return operators.filter((op) => op.status === 'supported');
}

export function getOperatorsByEngine(engine: string): Operator[] {
  return operators.filter((op) => op.engine.includes(engine));
}

export function getCategoriesWithCount(): { category: OperatorCategory | 'all'; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const op of operators) {
    counts[op.category] = (counts[op.category] || 0) + 1;
  }
  return Object.entries(counts).map(([cat, count]) => ({
    category: cat as OperatorCategory | 'all',
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    count,
  }));
}

export const OPERATOR_COUNT = operators.length;