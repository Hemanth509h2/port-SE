import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import siteRoutes from './routes/site.js';
import mediaRoutes from './routes/media.js';
import enquiryRoutes from './routes/enquiries.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');

// Tables + admin user are ensured once per process (once per cold start on Vercel).
let ready;
export const ensureDb = () => {
  ready ??= initDb().catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
};

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(','), credentials: false }));
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', async (req, res, next) => {
  await ensureDb();
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/enquiries', enquiryRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// Express 5 forwards rejected promises from async handlers here.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Something went wrong' });
});

export default app;
