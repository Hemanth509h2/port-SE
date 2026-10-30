import 'server-only';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

// Fetches { global, page } for a slug, or null if the page doesn't exist. Always fresh: edits go live on save.
export async function loadPage(slug) {
  const res = await fetch(`${BACKEND}/api/site/render/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Backend responded ${res.status}`);
  return res.json();
}

export function pageMetadata(data) {
  if (!data) return {};
  const { global, page } = data;
  const title = page.seo?.title || `${page.title} | ${global.siteName || ''}`;
  const description = page.seo?.description || '';
  return { title, description, openGraph: { title, description, images: ['/og.jpg'] } };
}
