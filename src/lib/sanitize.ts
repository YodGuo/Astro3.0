/**
 * HTML sanitizer for Cloudflare Workers / Edge runtime.
 * Pure-string implementation — no DOM dependency.
 */
const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'strong', 'em', 's',
  'a', 'br', 'hr', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'div', 'span',
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a:   ['href', 'title', 'rel', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  td:  ['colspan', 'rowspan'],
  th:  ['colspan', 'rowspan'],
  div: ['class'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
};

const DANGEROUS_PROTOCOLS = new Set(['javascript', 'data', 'vbscript']);

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  let clean = dirty.replace(/<!--[\s\S]*?-->/g, '');
  clean = clean.replace(/<(\/?)([\w-]+)([^>]*)>/g, (_match, close, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return '';
    if (close) return `</${t}>`;
    const safeAttrs = filterAttrs(t, attrs);
    return `<${t}${safeAttrs}>`;
  });
  return clean;
}

function filterAttrs(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag] ?? [];
  const result: string[] = [];
  const attrRe = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = attrRe.exec(raw)) !== null) {
    const [, name, v1, v2, v3] = m;
    if (!allowed.includes(name.toLowerCase())) continue;
    const val = (v1 ?? v2 ?? v3 ?? '').trim();
    if (['href', 'src'].includes(name)) {
      const protocol = val.split(':')[0].toLowerCase();
      if (DANGEROUS_PROTOCOLS.has(protocol)) continue;
    }
    result.push(`${name}="${val.replace(/"/g, '&quot;')}"`);
  }
  if (tag === 'a' && !result.some(a => a.startsWith('rel='))) {
    result.push('rel="noopener noreferrer"');
  }
  return result.length ? ' ' + result.join(' ') : '';
}
