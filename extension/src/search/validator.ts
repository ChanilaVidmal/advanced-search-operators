import { operators } from '@/data/operators';
import type { Operator } from '@/types/operator';

export interface Token {
  type: 'operator' | 'value' | 'text' | 'quotes' | 'space';
  value: string;
  start: number;
  end: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  fix?: string;
  token?: Token;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  tokens: Token[];
  query: string;
}

export function tokenize(query: string): Token[] {
  const tokens: Token[] = [];
  const opPattern = /(site:|filetype:|intitle:|inurl:|intext:|allintitle:|allinurl:|allintext:|related:|define:|source:|location:|before:|after:|daterange:|inanchor:|allinanchor:|ext:|inbody:|cache:|link:|info:|phonebook:|rphonebook:|bphonebook:|inposttitle:|allinposttitle:|inpostauthor:|blogurl:|group:|insubject:|msgid:|AROUND|OR|AND|weather:|stocks:|map:|movie:|film:|book:)/gi;

  let pos = 0;
  const segments: { type: Token['type']; value: string; start: number; end: number }[] = [];

  let m: RegExpExecArray | null;
  const regex = new RegExp(opPattern.source, 'gi');

  while ((m = regex.exec(query)) !== null) {
    if (m.index > pos) {
      const text = query.slice(pos, m.index);
      segments.push({ type: 'text', value: text, start: pos, end: m.index });
    }
    segments.push({ type: 'operator', value: m[0], start: m.index, end: m.index + m[0].length });
    pos = m.index + m[0].length;
  }

  if (pos < query.length) {
    segments.push({ type: 'text', value: query.slice(pos), start: pos, end: query.length });
  }

  for (const seg of segments) {
    if (seg.type === 'text') {
      let tPos = seg.start;
      const parts = seg.value.match(/"[^"]*"|\S+/g) || [];
      for (const part of parts) {
        const idx = seg.value.indexOf(part, tPos - seg.start);
        const absStart = seg.start + idx;
        const absEnd = absStart + part.length;
        if (part.startsWith('"') && part.endsWith('"')) {
          tokens.push({ type: 'quotes', value: part, start: absStart, end: absEnd });
        } else {
          tokens.push({ type: 'value', value: part, start: absStart, end: absEnd });
        }
        tPos = absEnd;
      }
    } else {
      tokens.push(seg);
    }
  }

  return tokens;
}

export function validateQuery(query: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const tokens = tokenize(query);
  const trimmed = query.trim();

  if (!trimmed) {
    return { valid: true, issues: [], tokens, query };
  }

  // ---- Rule 1: Unknown operators ----
  const operatorTokens = tokens.filter((t) => t.type === 'operator');
  for (const token of operatorTokens) {
    const opLower = token.value.toLowerCase();
    const known = operators.find(
      (o) => o.operator.toLowerCase() === opLower
    );
    if (!known) {
      const suggestion = operators.find((o) =>
        o.operator.toLowerCase().startsWith(opLower.slice(0, 3))
      );
      issues.push({
        type: 'error',
        rule: 'unknown-operator',
        message: `Unknown operator "${token.value}"`,
        fix: suggestion ? `Did you mean "${suggestion.operator}"?` : undefined,
        token,
      });
    }
  }

  // ---- Rule 2: Deprecated operators ----
  for (const token of operatorTokens) {
    const opLower = token.value.toLowerCase();
    const known = operators.find(
      (o) => o.operator.toLowerCase() === opLower
    );
    if (known && known.status === 'deprecated') {
      issues.push({
        type: 'warning',
        rule: 'deprecated-operator',
        message: `"${known.operator}" is deprecated`,
        fix: `Consider removing "${known.operator}" from your query`,
        token,
      });
    }
  }

  // ---- Rule 3: Duplicate operators ----
  const opCount = new Map<string, Token[]>();
  for (const token of operatorTokens) {
    const key = token.value.toLowerCase();
    if (!opCount.has(key)) opCount.set(key, []);
    opCount.get(key)!.push(token);
  }
  for (const [op, occ] of opCount) {
    if (occ.length > 1) {
      issues.push({
        type: 'warning',
        rule: 'duplicate-operator',
        message: `"${op}" used ${occ.length} times`,
        fix: 'Remove duplicate operators, they may conflict',
        token: occ[1],
      });
    }
  }

  // ---- Rule 4: Missing quotes for phrases ----
  const valueTokens = tokens.filter((t) => t.type === 'value');
  for (const token of valueTokens) {
    if (token.value.includes(' ') && !token.value.startsWith('"')) {
      issues.push({
        type: 'warning',
        rule: 'missing-quotes',
        message: `Phrase "${token.value}" may need quotes`,
        fix: `"${token.value}"`,
        token,
      });
    }
  }

  // ---- Rule 5: Invalid syntax (operator with no value) ----
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'operator' && t.value.endsWith(':')) {
      const next = tokens[i + 1];
      if (!next || (next.type !== 'value' && next.type !== 'quotes')) {
        issues.push({
          type: 'warning',
          rule: 'missing-value',
          message: `"${t.value}" has no value after it`,
          fix: `${t.value}keyword`,
          token: t,
        });
      }
    }
  }

  // ---- Rule 6: Unclosed quotes ----
  const quoteCount = (query.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    issues.push({
      type: 'error',
      rule: 'unclosed-quotes',
      message: 'Unclosed quotation mark',
      fix: 'Add a closing " to match the opening one',
    });
  }

  return {
    valid: issues.filter((i) => i.type === 'error').length === 0,
    issues,
    tokens,
    query,
  };
}

export function applyFix(_fix: string, query: string): string {
  return query;
}

export function getOperatorSuggestions(token: string): Operator[] {
  const lower = token.toLowerCase();
  return operators.filter((o) => o.operator.toLowerCase().includes(lower));
}