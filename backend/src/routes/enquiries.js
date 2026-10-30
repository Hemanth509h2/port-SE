import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const clip = (v, n) => (v == null ? null : String(v).trim().slice(0, n) || null);

// Naive in-memory rate limit for the public contact form.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

router.post('/', async (req, res) => {
  const { name, email, phone, service, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot field filled by bots
  if (!clip(name, 120)) return res.status(400).json({ error: 'Please tell us your name' });
  if (!clip(email, 200) && !clip(phone, 40)) return res.status(400).json({ error: 'Please share an email or phone number' });
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many requests, please try again later' });
  await query(
    'INSERT INTO enquiries (name, email, phone, service, message) VALUES ($1, $2, $3, $4, $5)',
    [clip(name, 120), clip(email, 200), clip(phone, 40), clip(service, 120), clip(message, 4000)]
  );
  res.status(201).json({ ok: true });
});

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 500');
  res.json(rows);
});

router.patch('/:id', requireAuth, async (req, res) => {
  await query('UPDATE enquiries SET is_read = $1 WHERE id = $2', [!!req.body?.is_read, req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await query('DELETE FROM enquiries WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
