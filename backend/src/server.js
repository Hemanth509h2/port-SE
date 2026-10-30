// Local / VPS entry point. On Vercel, api/index.js exports the same app as a serverless function.
import app, { ensureDb } from './app.js';

const port = Number(process.env.PORT) || 5000;
ensureDb()
  .then(() => app.listen(port, () => console.log(`API ready on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
