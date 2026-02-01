// Format Detection Utility for TextShift
// Detects HTML, Markdown, Rich Text, Code, and other formats

export type DetectedFormat = 
  | 'plain'
  | 'html'
  | 'markdown'
  | 'rich-text'
  | 'code'
  | 'json'
  | 'xml'
  | 'latex';

export interface FormatDetectionResult {
  format: DetectedFormat;
  confidence: number; // 0-100
  details: string;
  hasFormatting: boolean;
}

// HTML detection patterns
const HTML_PATTERNS = {
  tags: /<\/?[a-z][\s\S]*?>/i,
  doctype: /<!DOCTYPE\s+html/i,
  commonTags: /<(p|div|span|h[1-6]|a|img|ul|ol|li|table|tr|td|th|strong|em|br|hr|nav|section|article|header|footer|main|aside|form|input|button|label|select|option|textarea)[\s>]/i,
  attributes: /<[a-z]+\s+[a-z-]+\s*=/i,
  entities: /&(nbsp|amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/i,
  comments: /<!--[\s\S]*?-->/,
  selfClosing: /<(br|hr|img|input|meta|link)\s*\/?>/i,
};

// Markdown detection patterns
const MARKDOWN_PATTERNS = {
  headers: /^#{1,6}\s+.+$/m,
  boldAsterisks: /\*\*[^*]+\*\*/,
  boldUnderscores: /__[^_]+__/,
  italicAsterisks: /\*[^*]+\*/,
  italicUnderscores: /_[^_]+_/,
  links: /\[([^\]]+)\]\(([^)]+)\)/,
  images: /!\[([^\]]*)\]\(([^)]+)\)/,
  codeBlocks: /```[\s\S]*?```/,
  inlineCode: /`[^`]+`/,
  blockquotes: /^>\s+.+$/m,
  unorderedLists: /^[\s]*[-*+]\s+.+$/m,
  orderedLists: /^[\s]*\d+\.\s+.+$/m,
  horizontalRules: /^(---|\*\*\*|___)$/m,
  tables: /\|.+\|/,
  strikethrough: /~~[^~]+~~/,
  taskLists: /^[\s]*[-*+]\s+\[([ x])\]/m,
};

// Code detection patterns
const CODE_PATTERNS = {
  functions: /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|=>\s*{|def\s+\w+\s*\(|class\s+\w+/,
  variables: /(const|let|var|int|string|bool|float)\s+\w+\s*=/,
  imports: /^(import|from|require|using|include)\s+/m,
  brackets: /[{}\[\]]/,
  semicolons: /;\s*$/m,
  comments: /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/m,
};

// JSON detection
const JSON_PATTERNS = {
  object: /^\s*\{[\s\S]*\}\s*$/,
  array: /^\s*\[[\s\S]*\]\s*$/,
  keyValue: /"[^"]+"\s*:\s*/,
};

// XML detection
const XML_PATTERNS = {
  declaration: /<\?xml[\s\S]*?\?>/,
  tags: /<[a-z_][\w.-]*[\s\S]*?>/i,
  closingTags: /<\/[a-z_][\w.-]*>/i,
};

// LaTeX detection
const LATEX_PATTERNS = {
  commands: /\\[a-z]+(\{[^}]*\}|\[[^\]]*\])?/i,
  mathInline: /\$[^$]+\$/,
  mathBlock: /\$\$[\s\S]+?\$\$/,
  environments: /\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/,
};

// Rich text patterns (from Word/Google Docs copy-paste)
const RICH_TEXT_PATTERNS = {
  msWordXml: /xmlns:w="urn:schemas-microsoft-com/,
  googleDocs: /id="docs-internal-guid/,
  notionBlocks: /data-block-id=/,
  hiddenSpans: /<span[^>]*style="[^"]*"[^>]*>/,
};

function countMatches(text: string, patterns: Record<string, RegExp>): number {
  let count = 0;
  for (const pattern of Object.values(patterns)) {
    if (pattern.test(text)) {
      count++;
    }
  }
  return count;
}

export function detectFormat(text: string): FormatDetectionResult {
  if (!text || text.trim().length === 0) {
    return { format: 'plain', confidence: 100, details: 'Empty or whitespace only', hasFormatting: false };
  }

  const scores: Record<DetectedFormat, number> = {
    'plain': 0,
    'html': 0,
    'markdown': 0,
    'rich-text': 0,
    'code': 0,
    'json': 0,
    'xml': 0,
    'latex': 0,
  };

  // Check for JSON first (strict format)
  try {
    JSON.parse(text);
    if (JSON_PATTERNS.object.test(text) || JSON_PATTERNS.array.test(text)) {
      scores['json'] = 95;
    }
  } catch {
    // Not valid JSON
  }

  // HTML detection
  const htmlMatches = countMatches(text, HTML_PATTERNS);
  if (htmlMatches >= 3) {
    scores['html'] = Math.min(95, 40 + htmlMatches * 10);
  } else if (htmlMatches >= 1) {
    scores['html'] = 20 + htmlMatches * 15;
  }

  // Markdown detection
  const mdMatches = countMatches(text, MARKDOWN_PATTERNS);
  if (mdMatches >= 3) {
    scores['markdown'] = Math.min(90, 30 + mdMatches * 12);
  } else if (mdMatches >= 1) {
    scores['markdown'] = 15 + mdMatches * 15;
  }

  // Rich text detection
  const richTextMatches = countMatches(text, RICH_TEXT_PATTERNS);
  if (richTextMatches >= 1) {
    scores['rich-text'] = 60 + richTextMatches * 15;
  }

  // Code detection
  const codeMatches = countMatches(text, CODE_PATTERNS);
  if (codeMatches >= 3) {
    scores['code'] = Math.min(85, 25 + codeMatches * 15);
  }

  // XML detection (but not HTML)
  if (XML_PATTERNS.declaration.test(text) || 
      (XML_PATTERNS.tags.test(text) && !HTML_PATTERNS.commonTags.test(text))) {
    scores['xml'] = 70;
  }

  // LaTeX detection
  const latexMatches = countMatches(text, LATEX_PATTERNS);
  if (latexMatches >= 2) {
    scores['latex'] = Math.min(85, 40 + latexMatches * 15);
  }

  // Find the highest scoring format
  let maxScore = 0;
  let detectedFormat: DetectedFormat = 'plain';
  
  for (const [format, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedFormat = format as DetectedFormat;
    }
  }

  // If no format detected with confidence > 20, it's plain text
  if (maxScore < 20) {
    return { format: 'plain', confidence: 100, details: 'No formatting detected', hasFormatting: false };
  }

  const formatDetails: Record<DetectedFormat, string> = {
    'plain': 'Plain text without formatting',
    'html': 'HTML markup detected (tags, attributes, entities)',
    'markdown': 'Markdown formatting detected (headers, bold, links, lists)',
    'rich-text': 'Rich text from Word/Google Docs detected',
    'code': 'Programming code detected',
    'json': 'JSON data structure detected',
    'xml': 'XML markup detected',
    'latex': 'LaTeX formatting detected',
  };

  return {
    format: detectedFormat,
    confidence: maxScore,
    details: formatDetails[detectedFormat],
    hasFormatting: true,
  };
}

// Strip HTML tags and decode entities
export function stripHtml(html: string): string {
  // Remove script and style tags with content
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  
  // Replace block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<hr\s*\/?>/gi, '\n---\n');
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };
  
  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'gi'), char);
  }
  
  // Decode numeric entities
  text = text.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  text = text.trim();
  
  return text;
}

// Strip Markdown formatting
export function stripMarkdown(markdown: string): string {
  let text = markdown;
  
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold/italic
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  
  // Remove strikethrough
  text = text.replace(/~~([^~]+)~~/g, '$1');
  
  // Convert links to just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');
  
  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Remove task list markers
  text = text.replace(/\[([ x])\]\s*/gi, '');
  
  // Remove horizontal rules
  text = text.replace(/^(---|\*\*\*|___)$/gm, '');
  
  // Clean up whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  text = text.trim();
  
  return text;
}

// Strip all formatting (HTML, Markdown, etc.)
export function stripAllFormatting(text: string): string {
  const detection = detectFormat(text);
  
  switch (detection.format) {
    case 'html':
    case 'rich-text':
      return stripHtml(text);
    case 'markdown':
      return stripMarkdown(text);
    case 'json':
      try {
        const parsed = JSON.parse(text);
        return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
      } catch {
        return text;
      }
    case 'xml':
      return stripHtml(text); // XML can use same stripping as HTML
    default:
      return text;
  }
}

// Get format display name
export function getFormatDisplayName(format: DetectedFormat): string {
  const names: Record<DetectedFormat, string> = {
    'plain': 'Plain Text',
    'html': 'HTML',
    'markdown': 'Markdown',
    'rich-text': 'Rich Text',
    'code': 'Code',
    'json': 'JSON',
    'xml': 'XML',
    'latex': 'LaTeX',
  };
  return names[format];
}

// Get format color for UI
export function getFormatColor(format: DetectedFormat): string {
  const colors: Record<DetectedFormat, string> = {
    'plain': 'gray',
    'html': 'orange',
    'markdown': 'blue',
    'rich-text': 'purple',
    'code': 'green',
    'json': 'yellow',
    'xml': 'red',
    'latex': 'pink',
  };
  return colors[format];
}
