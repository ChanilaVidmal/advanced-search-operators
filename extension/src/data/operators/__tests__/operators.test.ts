import { describe, it, expect } from 'vitest';
import { operators, searchOperators, getOperatorById, getOperatorsByCategory, getSupportedOperators } from '../index';
import type { OperatorCategory, OperatorStatus } from '@/types/operator';

const validCategories: OperatorCategory[] = [
  'basic', 'domain', 'files', 'time', 'url', 'title', 'content', 'news', 'boolean', 'math', 'deprecated',
];

const validStatuses: OperatorStatus[] = ['supported', 'limited', 'deprecated'];

describe('operators database', () => {
  it('should have at least 50 operators', () => {
    expect(operators.length).toBeGreaterThanOrEqual(50);
  });

  it('every operator should have required fields', () => {
    for (const op of operators) {
      expect(op.id).toBeTruthy();
      expect(op.operator).toBeTruthy();
      expect(op.name).toBeTruthy();
      expect(op.description).toBeTruthy();
      expect(op.syntax).toBeTruthy();
      expect(op.example).toBeTruthy();
      expect(op.category).toBeTruthy();
      expect(op.status).toBeTruthy();
      expect(op.engine).toBeInstanceOf(Array);
      expect(op.engine.length).toBeGreaterThan(0);
    }
  });

  it('every operator should have a unique id', () => {
    const ids = operators.map((op) => op.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every operator should have a valid category', () => {
    for (const op of operators) {
      expect(validCategories).toContain(op.category);
    }
  });

  it('every operator should have a valid status', () => {
    for (const op of operators) {
      expect(validStatuses).toContain(op.status);
    }
  });

  it('every operator should have unique operator values within their category', () => {
    const seen = new Map<string, string>();
    for (const op of operators) {
      const key = `${op.category}:${op.operator}`;
      if (seen.has(key)) {
        throw new Error(`Duplicate operator "${op.operator}" in category "${op.category}" (ids: ${seen.get(key)}, ${op.id})`);
      }
      seen.set(key, op.id);
    }
  });

  it('searchOperators should find operators by name', () => {
    const results = searchOperators('site');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((op) => op.id === 'site')).toBe(true);
  });

  it('searchOperators should find operators by description', () => {
    const results = searchOperators('file');
    expect(results.length).toBeGreaterThan(0);
  });

  it('searchOperators should return empty for no matches', () => {
    const results = searchOperators('zzzznotrealoperator');
    expect(results).toEqual([]);
  });

  it('searchOperators should handle empty query', () => {
    const results = searchOperators('');
    expect(results.length).toBe(operators.length);
  });

  it('getOperatorById should return correct operator', () => {
    const op = getOperatorById('site');
    expect(op).toBeDefined();
    expect(op?.operator).toBe('site:');
  });

  it('getOperatorById should return undefined for unknown id', () => {
    const op = getOperatorById('nonexistent');
    expect(op).toBeUndefined();
  });

  it('getOperatorsByCategory should return operators in that category', () => {
    const basic = getOperatorsByCategory('boolean');
    expect(basic.length).toBeGreaterThan(0);
    for (const op of basic) {
      expect(op.category).toBe('boolean');
    }
  });

  it('getOperatorsByCategory should return empty for valid but empty category', () => {
    const results = getOperatorsByCategory('deprecated');
    expect(results.length).toBeGreaterThan(0);
  });

  it('getSupportedOperators should only include supported operators', () => {
    const supported = getSupportedOperators();
    for (const op of supported) {
      expect(op.status).toBe('supported');
    }
  });
});