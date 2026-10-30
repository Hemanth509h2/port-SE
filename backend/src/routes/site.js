import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { sanitizeDoc } from '../lib/sanitize.js';

const router = Router();
const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;
const MAX_REVISIONS = 40;

async function getDoc(key) {
  const { rows } = await query('SELECT data, updated_at FROM documents WHERE key = $1', [key]);
  return rows[0] || null;
}

async function saveDoc(key, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prev = await client.query('SELECT data FROM documents WHERE key = $1 FOR UPDATE', [key]);
    if (prev.rows[0]) {
      await client.query('INSERT INTO document_revisions (key, data) VALUES ($1, $2)', [key, prev.rows[0].data]);
      await client.query(
        `DELETE FROM document_revisions WHERE key = $1 AND id NOT IN
           (SELECT id FROM document_revisions WHERE key = $1 ORDER BY created_at DESC LIMIT ${MAX_REVISIONS})`,
        [key]
      );
    }
    const { rows } = await client.query(
      `INSERT INTO documents (key, data, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING updated_at`,
      [key, data]
    );
    await client.query('COMMIT');
    return rows[0].updated_at;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/* ---------- public ---------- */

// Everything the frontend needs to render one page in a single round trip.
router.get('/render/:slug', async (req, res) => {
  const [global, page] = await Promise.all([getDoc('global'), getDoc(`page:${req.params.slug}`)]);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json({ global: global?.data || {}, page: page.data });
});

router.get('/global', async (req, res) => {
  const doc = await getDoc('global');
  res.json(doc?.data || {});
});

router.get('/pages', async (req, res) => {
  const { rows } = await query(
    `SELECT substring(key from 6) AS slug, data->>'title' AS title, updated_at
     FROM documents WHERE key LIKE 'page:%' ORDER BY (key = 'page:home') DESC, key`
  );
  res.json(rows);
});

router.get('/pages/:slug', async (req, res) => {
  const doc = await getDoc(`page:${req.params.slug}`);
  if (!doc) return res.status(404).json({ error: 'Page not found' });
  res.json(doc.data);
});

/* ---------- admin ---------- */

router.put('/global', requireAuth, async (req, res) => {
  const updatedAt = await saveDoc('global', sanitizeDoc(req.body || {}));
  res.json({ ok: true, updatedAt });
});

router.put('/pages/:slug', requireAuth, async (req, res) => {
  const { slug } = req.params;
  if (!SLUG.test(slug)) return res.status(400).json({ error: 'Slug may only contain lowercase letters, numbers and dashes' });
  const data = sanitizeDoc(req.body || {});
  if (!Array.isArray(data.sections)) data.sections = [];
  const updatedAt = await saveDoc(`page:${slug}`, data);
  res.json({ ok: true, updatedAt });
});

router.delete('/pages/:slug', requireAuth, async (req, res) => {
  if (req.params.slug === 'home') return res.status(400).json({ error: 'The home page cannot be deleted' });
  await query('DELETE FROM documents WHERE key = $1', [`page:${req.params.slug}`]);
  res.json({ ok: true });
});

router.get('/revisions', requireAuth, async (req, res) => {
  const key = String(req.query.key || '');
  const { rows } = await query(
    'SELECT id, key, created_at FROM document_revisions WHERE key = $1 ORDER BY created_at DESC LIMIT $2',
    [key, MAX_REVISIONS]
  );
  res.json(rows);
});

router.get('/revisions/:id', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM document_revisions WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Revision not found' });
  res.json(rows[0]);
});

router.post('/revisions/:id/restore', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT key, data FROM document_revisions WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Revision not found' });
  const updatedAt = await saveDoc(rows[0].key, rows[0].data);
  res.json({ ok: true, key: rows[0].key, data: rows[0].data, updatedAt });
});

export default router;
