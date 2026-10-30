import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  const { rows } = await query('SELECT * FROM admins WHERE username = $1', [username]);
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json({ token: signToken(admin), username: admin.username });
});

router.get('/me', requireAuth, (req, res) => res.json({ username: req.admin.username }));

router.post('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  const { rows } = await query('SELECT * FROM admins WHERE id = $1', [req.admin.sub]);
  if (!rows[0] || !(await bcrypt.compare(currentPassword || '', rows[0].password_hash))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await query('UPDATE admins SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(newPassword, 10), req.admin.sub]);
  res.json({ ok: true });
});

export default router;
