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

const opRegex = /(?:^|\s)(AROUND\(\d+\)|OR|AND)(?=\s|$)/gi;

const colonOpRegex = /(site:|filetype:|intitle:|inurl:|intext:|allintitle:|allinurl:|allintext:|related:|define:|source:|location:|before:|after:|daterange:|inanchor:|allinanchor:|ext:|inbody:|cache:|link:|info:|phonebook:|rphonebook:|bphonebook:|inposttitle:|allinposttitle:|inpostauthor:|blogurl:|group:|insubject:|msgid:|weather:|stocks:|map:|movie:|film:|book:)/gi;

export function tokenize(query: string): Token[] {
  const tokens: Token[] = [];

  if (!query) return tokens;

  // Step 1: Extract quoted regions first
  const quotedRanges: { start: number; end: number; value: string }[] = [];
  const quoteRe = /"[^"]*"/g;
  let qm: RegExpExecArray | null;
  while ((qm = quoteRe.exec(query)) !== null) {
    quotedRanges.push({ start: qm.index, end: qm.index + qm[0].length, value: qm[0] });
  }

  function isInsideQuotes(pos: number): boolean {
    return quotedRanges.some((r) => pos >= r.start && pos < r.end);
  }

  // Step 2: Extract operators with colons (non-overlapping, skip quoted regions)
  const colonOps: { start: number; end: number; value: string }[] = [];
  const cRe = new RegExp(colonOpRegex.source, 'gi');
  let cm: RegExpExecArray | null;
  while ((cm = cRe.exec(query)) !== null) {
    if (!isInsideQuotes(cm.index)) {
      colonOps.push({ start: cm.index, end: cm.index + cm[0].length, value: cm[0] });
    }
  }

  // Step 3: Extract boolean operators (AROUND(N), OR, AND) outside quotes
  const boolOps: { start: number; end: number; value: string }[] = [];
  const bRe = new RegExp(opRegex.source, 'gi');
  let bm: RegExpExecArray | null;
  while ((bm = bRe.exec(query)) !== null) {
    if (!isInsideQuotes(bm.index)) {
      const val = bm[0].trim();
      boolOps.push({ start: bm.index + (bm[0].length - val.length), end: bm.index + bm[0].length, value: val });
    }
  }

  // Step 4: Merge all pre-extracted regions sorted by position
  const allExtracted: { start: number; end: number; value: string; type: Token['type'] }[] = [
    ...quotedRanges.map((r) => ({ ...r, type: 'quotes' as Token['type'] })),
    ...colonOps.map((r) => ({ ...r, type: 'operator' as Token['type'] })),
    ...boolOps.map((r) => ({ ...r, type: 'operator' as Token['type'] })),
  ].sort((a, b) => a.start - b.start);

  // Step 5: Walk through the query, emitting tokens
  let pos = 0;
  for (const ext of allExtracted) {
    if (ext.start < pos) continue;

    // Emit text between previous position and this extracted token
    if (ext.start > pos) {
      const text = query.slice(pos, ext.start);
      if (text.trim()) {
        tokens.push({ type: 'text', value: text.trim(), start: pos, end: ext.start });
      } else if (text.length > 0 && /^\s+$/.test(text)) {
        // skip pure whitespace
      }
    }

    tokens.push(ext);
    pos = ext.end;
  }

  // Emit remaining text
  if (pos < query.length) {
    const remaining = query.slice(pos).trim();
    if (remaining) {
      tokens.push({ type: 'text', value: remaining, start: pos, end: query.length });
    }
  }

  // Step 6: Split text tokens into value tokens (split on whitespace)
  const finalTokens: Token[] = [];
  for (const t of tokens) {
    if (t.type === 'text') {
      const parts = t.value.match(/\S+/g) || [];
      let offset = 0;
      for (const part of parts) {
        const idx = t.value.indexOf(part, offset);
        const absStart = t.start + idx;
        const absEnd = absStart + part.length;
        finalTokens.push({ type: 'value', value: part, start: absStart, end: absEnd });
        offset = idx + part.length;
      }
    } else {
      finalTokens.push(t);
    }
  }

  return finalTokens;
}

export function validateQuery(query: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const tokens = tokenize(query);
  const trimmed = query.trim();

  if (!trimmed) {
    return { valid: true, issues: [], tokens, query };
  }

  const operatorTokens = tokens.filter((t) => t.type === 'operator');

  // ---- Rule 1: Unknown operators ----
  for (const token of operatorTokens) {
    const opLower = token.value.toLowerCase();
    const known = operators.find((o) => o.operator.toLowerCase() === opLower);
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
    const known = operators.find((o) => o.operator.toLowerCase() === opLower);
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

export function applyFix(fix: string, query: string): string {
  if (!fix) return query;
  return fix;
}

export function getOperatorSuggestions(token: string): Operator[] {
  const lower = token.toLowerCase();
  return operators.filter((o) => o.operator.toLowerCase().includes(lower));
}