// sanitize-html is CommonJS but require()s the ESM-only htmlparser2, which Vercel's loader rejects
// (ERR_REQUIRE_ESM). We use a pre-bundled ESM copy instead: regenerate with `npm run vendor:sanitize`.
import sanitizeHtml from '../vendor/sanitize-html.js';

// Rich text produced by the admin editor (contentEditable + formatting toolbar).
const RICH = {
  allowedTags: ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span', 'a', 'br', 'div', 'p', 'ul', 'ol', 'li', 'font', 'sub', 'sup', 'mark', 'small', 'h1', 'h2', 'h3', 'h4', 'blockquote'],
  allowedAttributes: {
    '*': ['style', 'class'],
    a: ['href', 'target', 'rel'],
    font: ['color', 'size', 'face'],
  },
  allowedStyles: {
    '*': {
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
      'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgba?\([\d\s.,%]+\)$/i, /^[a-z]+$/i],
      'font-size': [/^[\d.]+(px|em|rem|%)$/, /^(xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large)$/],
      'font-weight': [/^(bold|normal|[1-9]00)$/],
      'font-style': [/^(italic|normal)$/],
      'font-family': [/^[\w\s,'"-]+$/],
      'text-decoration': [/^[a-z\s-]+$/],
      'text-decoration-line': [/^[a-z\s-]+$/],
      'text-align': [/^(left|right|center|justify|start|end)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
};

// Keys whose values are URLs / plain tokens rather than rich text.
const URL_KEYS = new Set(['src', 'href', 'url', 'image']);
const RAW_KEYS = new Set(['id', 'type', 'anchor', 'fit', 'pos', 'bg', 'fg', 'variant', 'align', 'slug', 'headingFont', 'bodyFont',
  'primary', 'dark', 'light', 'ink', 'muted', 'paper']);

function safeUrl(v) {
  const s = String(v).trim();
  if (/^(javascript|vbscript|data):/i.test(s.replace(/\s+/g, ''))) return '';
  return s;
}

function cleanRaw(v) {
  // tokens like colors, font names, ids — no markup allowed
  return String(v).replace(/[<>"`]/g, '');
}

export function sanitizeDoc(value, key = '') {
  if (Array.isArray(value)) return value.map((v) => sanitizeDoc(v, key));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitizeDoc(v, k);
    return out;
  }
  if (typeof value === 'string') {
    if (URL_KEYS.has(key)) return safeUrl(value);
    if (RAW_KEYS.has(key)) return cleanRaw(value);
    return sanitizeHtml(value, RICH);
  }
  return value;
}
