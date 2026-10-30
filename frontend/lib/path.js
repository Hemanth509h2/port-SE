// Tiny immutable helpers for editing nested JSON by dotted path, e.g. "page.sections.2.items.0.title".

export const split = (p) => (Array.isArray(p) ? p : String(p).split('.')).map((k) => (/^\d+$/.test(k) ? Number(k) : k));

export function getIn(obj, path) {
  return split(path).reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setIn(obj, path, value) {
  const keys = split(path);
  const rec = (o, i) => {
    if (i === keys.length) return value;
    const k = keys[i];
    const base = o ?? (typeof k === 'number' ? [] : {});
    const copy = Array.isArray(base) ? base.slice() : { ...base };
    copy[k] = rec(base[k], i + 1);
    return copy;
  };
  return rec(obj, 0);
}

export const uid = (p = 'x') => p + Math.random().toString(36).slice(2, 9);

// Deep copy that gives every object with an `id` a fresh one (for duplicating sections/items).
export function cloneFresh(x) {
  if (Array.isArray(x)) return x.map(cloneFresh);
  if (x && typeof x === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(x)) out[k] = k === 'id' ? uid(String(v).slice(0, 1) || 'x') : cloneFresh(v);
    return out;
  }
  return x;
}

export const cx = (...c) => c.filter(Boolean).join(' ');

export const img = (v) => (typeof v === 'string' ? { src: v } : v || {});

export const stripTags = (html) => String(html ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
