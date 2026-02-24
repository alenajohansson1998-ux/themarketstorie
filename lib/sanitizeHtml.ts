const BLOCKED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'meta',
  'link',
  'base',
  'frame',
  'frameset',
];

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

const SELF_CLOSING_TAGS = new Set(['br', 'hr', 'img']);
const GLOBAL_ALLOWED_ATTRS = new Set(['class', 'title', 'aria-label', 'aria-hidden', 'role']);
const TAG_ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'title']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
};

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);?/g, (_, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&colon;/gi, ':')
    .replace(/&tab;/gi, '\t')
    .replace(/&newline;/gi, '\n')
    .replace(/&nbsp;/gi, ' ');
}

function isSafeUrl(value: string): boolean {
  if (!value) return false;
  const normalized = decodeHtmlEntities(value)
    .replace(/[\u0000-\u001f\u007f-\u009f\s]+/g, '')
    .toLowerCase();

  if (!normalized) return false;
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('./') ||
    normalized.startsWith('../') ||
    normalized.startsWith('#')
  ) {
    return true;
  }

  return (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  );
}

function sanitizeAttributes(tagName: string, attributeChunk: string): string {
  const cleaned: string[] = [];
  const attrRegex = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`=]+)))?/g;
  let match: RegExpExecArray | null = attrRegex.exec(attributeChunk);
  let hasRel = false;
  let targetBlank = false;

  while (match) {
    const attrName = match[1].toLowerCase();
    const rawValue = match[2] ?? match[3] ?? match[4] ?? '';
    const value = rawValue.trim();

    const isTagAllowedAttr = TAG_ALLOWED_ATTRS[tagName]?.has(attrName) ?? false;
    if (!GLOBAL_ALLOWED_ATTRS.has(attrName) && !isTagAllowedAttr) {
      match = attrRegex.exec(attributeChunk);
      continue;
    }

    if (attrName.startsWith('on') || attrName === 'style') {
      match = attrRegex.exec(attributeChunk);
      continue;
    }

    if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(value)) {
      match = attrRegex.exec(attributeChunk);
      continue;
    }

    if (tagName === 'a' && attrName === 'target') {
      const normalizedTarget = value.toLowerCase();
      if (!['_blank', '_self', '_parent', '_top'].includes(normalizedTarget)) {
        match = attrRegex.exec(attributeChunk);
        continue;
      }
      if (normalizedTarget === '_blank') {
        targetBlank = true;
      }
    }

    if (tagName === 'a' && attrName === 'rel') {
      hasRel = true;
    }

    if (value) {
      cleaned.push(`${attrName}="${escapeHtmlAttribute(value)}"`);
    } else {
      cleaned.push(attrName);
    }

    match = attrRegex.exec(attributeChunk);
  }

  if (tagName === 'a' && targetBlank && !hasRel) {
    cleaned.push('rel="noopener noreferrer"');
  }

  return cleaned.length > 0 ? ` ${cleaned.join(' ')}` : '';
}

export function sanitizeRichHtml(html: unknown): string {
  if (typeof html !== 'string' || !html) return '';

  let clean = html.replace(/\u0000/g, '').replace(/<!--[\s\S]*?-->/g, '');

  for (const tag of BLOCKED_TAGS) {
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    clean = clean.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'), '');
  }

  clean = clean.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g, (_match, slash: string, rawTag: string, rawAttrs: string) => {
    const tagName = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      return '';
    }

    if (slash) {
      return `</${tagName}>`;
    }

    const attrs = sanitizeAttributes(tagName, rawAttrs);
    const selfClosing = SELF_CLOSING_TAGS.has(tagName) || /\/\s*$/.test(rawAttrs);
    if (selfClosing) {
      return `<${tagName}${attrs}>`;
    }

    return `<${tagName}${attrs}>`;
  });

  return clean;
}
