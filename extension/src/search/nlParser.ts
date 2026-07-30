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
  { pattern: /(?:from|on)\s+["']?([a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\.[a-z]{2,})?)["']?(?:\s|$)/gi, operator: 'site:', valueFn: (m) => m[1] },
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

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.pattern.exec(trimmed)) !== null) {
      blocks.push({
        id: crypto.randomUUID(),
        operator: rule.operator,
        value: rule.valueFn(m),
      });
    }
  }

  // Extract keywords from remaining unmatched text
  let keywords = trimmed.replace(/["']/g, '');
  // Remove known operator phrases to isolate the topic keywords
  const removePatterns = [
    /(?:from|on)\s+["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\.[a-z]{2,})?["']?/gi,
    /(?:from\s+)?(?:site|domain|website)\s*(?::|is|)\s*["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\.[a-z]{2,})?["']?/gi,
    /(?:filetype|format|type|kind)\s*(?::|is|of|)\s*["']?\w+["']?/gi,
    /\b(pdfs?|documents?|spreadsheets?|presentations?)\b/gi,
    /(?:title|intitle|heading)\s*(?::|is|contains?|has|with)\s+["'][^"']+["']/gi,
    /(?:with|that\s+has|containing|about)\s+["'][^"']+["']\s+in\s+(?:the\s+)?title/gi,
    /(?:url|inurl|path)\s*(?::|is|contains?|has)\s+["']?[a-z0-9_\/-]+["']?/gi,
    /(?:text|content|body|intext)\s*(?::|is|contains?|has)\s+["'][^"']+["']/gi,
    /(?:after|since|from|>)\s*["']?\d{4}["']?/gi,
    /(?:before|until|<)\s*["']?\d{4}["']?/gi,
    /(?:daterange|between)\s+\d{4}[-\s]+\d{4}/gi,
    /(?:language|lang)\s*(?::|is)\s+["']?\w+["']?/gi,
    /\b(?:define|definition|meaning)\s+(?:of\s+)?["']?\w+["']?/gi,
    /(?:related|similar)\s+(?:to\s+)?["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}["']?/gi,
    /(?:cache|cached|snapshot)\s+(?:of\s+)?["']?[a-z0-9][-a-z0-9]*\.[a-z]{2,}["']?/gi,
  ];
  for (const pattern of removePatterns) {
    keywords = keywords.replace(pattern, '');
  }
  keywords = keywords.replace(/\s+/g, ' ').trim();

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