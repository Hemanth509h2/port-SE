// Seeds the database: tables, admin user, project photos and the starting website content.
// Usage: npm run seed            -> only seeds if the site has no content yet
//        npm run seed -- --force -> replaces the website content (old content is kept as a revision)
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, pool, query } from '../src/db.js';
import { insertMedia } from '../src/routes/media.js';
import { IMAGES, buildContent } from './defaultContent.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes('--force');

async function main() {
  await initDb();
  console.log('✓ tables ready, admin user ensured');

  const existing = await query("SELECT 1 FROM documents WHERE key = 'page:home'");
  if (existing.rowCount && !force) {
    console.log('Site content already exists — nothing to do (use --force to reset content).');
    return;
  }

  // Upload seed photos once; reuse them on a forced re-seed.
  const ids = [];
  for (let i = 0; i < IMAGES.length; i++) {
    const filename = `se-${String(i).padStart(2, '0')}.jpg`;
    const found = await query('SELECT id FROM media WHERE filename = $1 ORDER BY id LIMIT 1', [filename]);
    if (found.rowCount) {
      ids.push(found.rows[0].id);
      continue;
    }
    const buffer = await fs.readFile(path.join(here, '..', 'seed', 'images', filename));
    const m = await insertMedia({ filename, mime: 'image/jpeg', buffer, alt: IMAGES[i][0] });
    ids.push(m.id);
  }
  console.log(`✓ ${ids.length} project photos in media library`);

  const img = (i) => ({ src: `/api/media/${ids[i]}`, alt: IMAGES[i][0] });
  const { global, pages } = buildContent(img);

  const save = async (key, data) => {
    const prev = await query('SELECT data FROM documents WHERE key = $1', [key]);
    if (prev.rowCount) await query('INSERT INTO document_revisions (key, data) VALUES ($1, $2)', [key, prev.rows[0].data]);
    await query(
      `INSERT INTO documents (key, data) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [key, data]
    );
  };
  await save('global', global);
  for (const [slug, data] of Object.entries(pages)) await save(`page:${slug}`, data);
  console.log(`✓ content saved: global + pages (${Object.keys(pages).join(', ')})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
