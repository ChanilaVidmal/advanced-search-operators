import type { OperatorBlock } from '@/types/operator';

export interface NlParseResult {
  blocks: OperatorBlock[];
  keywords: string;
  confidence: number;
  description: string;
}

interface NlRule {
  pattern: RegExp;
  operator: string;
  valueFn: (match: RegExpExecArray) => string;
}

const rules: NlRule[] = [
  { pattern: /(?:from\s+)?(?:site|domain|website)\s*(?::|is|)\s*["']?([a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\.[a-z]{2,})?)["']?/gi, operator: 'site:', valueFn: (m) => m[1] },
  { pattern: /(?:from\s+)(?:site|domain)\s+["']?([a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\.[a-z]{2,})?)["']?/gi, operator: 'site:', valueFn: (m) => m[1] },
  { pattern: /(?:filetype|format|type|kind)\s*(?::|is|of|)\s*["']?(pdf|docx?|xlsx?|pptx?|txt|csv|json|xml|zip|tar|gz|html?)["']?/gi, operator: 'filetype:', valueFn: (m) => m[1] },
  { pattern: /\b(pdfs?|documents?|spreadsheets?|presentations?)\b/gi, operator: 'filetype:', valueFn: (m) => ({ pdfs: 'pdf', documents: 'doc', spreadsheets: 'xls', presentations: 'ppt' })[m[1].toLowerCase()] || 'pdf' },
  { pattern: /(?:title|intitle|heading)\s*(?::|is|contains?|has|with)\s+["']([^"']+)["']/gi, operator: 'intitle:', valueFn: (m) => m[1] },
  { pattern: /(?:with|that\s+has|containing|about)\s+["']([^"']+)["']\s+in\s+(?:the\s+)?title/gi, operator: 'intitle:', valueFn: (m) => m[1] },
  { pattern: /(?:url|inurl|path)\s*(?::|is|contains?|has)\s+["']?([a-z0-9_/-]+)["']?/gi, operator: 'inurl:', valueFn: (m) => m[1] },
  { pattern: /(?:text|content|body|intext)\s*(?::|is|contains?|has)\s+["']([^"']+)["']/gi, operator: 'intext:', valueFn: (m) => m[1] },
  { pattern: /(?:after|since|from|>)\s*["']?(\d{4})["']?/gi, operator: 'after:', valueFn: (m) => m[1] },
  { pattern: /(?:before|until|<)\s*["']?(\d{4})["']?/gi, operator: 'before:', valueFn: (m) => m[1] },
  { pattern: /(?:daterange|between)\s+(\d{4})[-\s]+(\d{4})/gi, operator: 'daterange:', valueFn: (m) => `${m[1]}-${m[2]}` },
  { pattern: /(?:language|lang)\s*(?::|is)\s+["']?(\w+)["']?/gi, operator: 'source:', valueFn: (m) => m[1] },
  { pattern: /\b(?:define|definition|meaning)\s+(?:of\s+)?["']?(\w+)["']?/gi, operator: 'define:', valueFn: (m) => m[1] },
  { pattern: /(?:related|similar)\s+(?:to\s+)?["']?(?:site:)?([a-z0-9][-a-z0-9]*\.[a-z]{2,})["']?/gi, operator: 'related:', valueFn: (m) => m[1] },
  { pattern: /(?:cache|cached|snapshot)\s+(?:of\s+)?["']?([a-z0-9][-a-z0-9]*\.[a-z]{2,})["']?/gi, operator: 'cache:', valueFn: (m) => m[1] },
];

export function parseNaturalLanguage(input: string): NlParseResult | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const blocks: OperatorBlock[] = [];
  let remaining = trimmed;
  let matchedLength = 0;

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.pattern.exec(remaining)) !== null) {
      const value = rule.valueFn(m);
      blocks.push({
        id: crypto.randomUUID(),
        operator: rule.operator,
        value: value,
      });
      matchedLength += m[0].length;
    }
  }

  // Extract keywords from remaining unmatched text
  const keywords = trimmed
    .replace(/["']/g, '')
    .replace(/(?:from\s+)?(?:site|domain|website)\s*(?::|is|)\s*["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\.[a-z]{2,})?["']?/gi, '')
    .replace(/(?:filetype|format|type|kind)\s*(?::|is|of|)\s*["']?\w+["']?/gi, '')
    .replace(/\b(pdfs?|documents?|spreadsheets?|presentations?)\b/gi, '')
    .replace(/(?:title|intitle|heading)\s*(?::|is|contains?|has|with)\s+["'][^"']+["']/gi, '')
    .replace(/(?:with|that\s+has|containing|about)\s+["'][^"']+["']\s+in\s+(?:the\s+)?title/gi, '')
    .replace(/(?:url|inurl|path)\s*(?::|is|contains?|has)\s+["']?[a-z0-9_/-]+["']?/gi, '')
    .replace(/(?:text|content|body|intext)\s*(?::|is|contains?|has)\s+["'][^"']+["']/gi, '')
    .replace(/(?:after|since|from|>)\s*["']?\d{4}["']?/gi, '')
    .replace(/(?:before|until|<)\s*["']?\d{4}["']?/gi, '')
    .replace(/(?:daterange|between)\s+\d{4}[-\s]+\d{4}/gi, '')
    .replace(/(?:language|lang)\s*(?::|is)\s+["']?\w+["']?/gi, '')
    .replace(/\b(?:define|definition|meaning)\s+(?:of\s+)?["']?\w+["']?/gi, '')
    .replace(/(?:related|similar)\s+(?:to\s+)?["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}["']?/gi, '')
    .replace(/(?:cache|cached|snapshot)\s+(?:of\s+)?["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}["']?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const confidence = blocks.length > 0 ? Math.min(0.3 + blocks.length * 0.15, 0.95) : 0;

  // Determine description
  let description = '';
  if (blocks.length === 0 && keywords) {
    description = `Search for "${keywords}"`;
  } else if (blocks.length > 0) {
    const parts = blocks.map((b) => `${b.operator}${b.value || '<value>'}`);
    description = `${parts.join(' · ')}${keywords ? ` — ${keywords}` : ''}`;
  }

  return {
    blocks,
    keywords,
    confidence,
    description,
  };
}