import { Router } from 'express';
import multer from 'multer';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => cb(null, ALLOWED.has(file.mimetype)),
});

export async function insertMedia({ filename, mime, buffer, alt = '' }) {
  const { rows } = await query(
    'INSERT INTO media (filename, mime, size, alt, data) VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, mime, size, alt, created_at',
    [filename, mime, buffer.length, alt, buffer]
  );
  return { ...rows[0], url: `/api/media/${rows[0].id}` };
}

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT id, filename, mime, size, alt, created_at FROM media ORDER BY id DESC');
  res.json(rows.map((r) => ({ ...r, url: `/api/media/${r.id}` })));
});

router.post('/', requireAuth, upload.array('files'), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No supported image files received' });
  const saved = [];
  for (const f of req.files) {
    saved.push(await insertMedia({ filename: f.originalname, mime: f.mimetype, buffer: f.buffer }));
  }
  res.status(201).json(saved);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const { rows } = await query('UPDATE media SET alt = $1 WHERE id = $2 RETURNING id, alt', [String(req.body?.alt || ''), req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await query('DELETE FROM media WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Public: serve the image bytes. Ids never get reused, so the response is immutable.
router.get('/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return res.status(404).end();
  const { rows } = await query('SELECT mime, data FROM media WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).end();
  res.set('Content-Type', rows[0].mime);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (rows[0].mime === 'image/svg+xml') res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
  res.send(rows[0].data);
});

export default router;
