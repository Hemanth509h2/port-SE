import pg from 'pg';
import bcrypt from 'bcryptjs';

const raw = process.env.DATABASE_URL_2;
if (!raw) throw new Error('DATABASE_URL_2 is not set');

// Strip libpq-only query params (channel_binding, pool_timeout, ...) and configure SSL explicitly.
const url = new URL(raw);
const needsSsl = url.searchParams.get('sslmode') !== 'disable';
url.search = '';

export const pool = new pg.Pool({
  connectionString: url.toString(),
  ssl: needsSsl ? { rejectUnauthorized: true } : false,
  max: 8,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('[pg] idle client error', err.message));

export const query = (text, params) => pool.query(text, params);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One JSON document per editable thing: 'global' (header, footer, theme) and 'page:<slug>'
CREATE TABLE IF NOT EXISTS documents (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_revisions (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS document_revisions_key_idx ON document_revisions (key, created_at DESC);

CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service TEXT,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function initDb() {
  await query(SCHEMA);
  await ensureAdmin();
}

export async function ensureAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return;
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await query(
    `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_USERNAME, hash]
  );
}
