# Sharma Engineering — website + visual editor

```
backend/    Express API + PostgreSQL (Neon) — content, images, enquiries, admin login
frontend/   Next.js 16 site (public pages) + /admin visual editor
```

## Run it

```bash
cd backend
npm install
npm run seed      # first time only: creates tables, admin user, uploads the 34 project photos, starter content
npm run dev       # API on http://localhost:5000
```

```bash
cd frontend
npm install
npm run dev       # site on http://localhost:3000, editor on http://localhost:3000/admin
```

Admin username/password are in `backend/.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). Change the password from
**Settings → Account** in the editor, or edit `.env` and restart the backend.

## Editing the site (/admin)

It works like a Word document laid over the real website:

| Do this | Result |
| --- | --- |
| Click any text | Type to change it. The toolbar gives font, size, bold/italic/underline, colour, highlight, alignment, lists, links |
| Click an image | Image tools appear: replace, alt text, fill/fit, focus point, remove. Double-click opens the library |
| Drag an image onto another image | They swap places |
| Drag a photo from **🖼 Media** onto an image | Replaces it |
| Drag a photo (or an image on the page, or a file from your computer) onto empty space | It's placed there as a **free image** — drag it anywhere, resize from the corner, rotate, layer, add shadow |
| Hover a card / link / number | ← → ⧉ ✕ to reorder, duplicate or delete; “＋ Add …” to add more |
| Hover a section | Move up/down, add a free image, style (background, text colour, spacing, anchor), duplicate, hide, delete; “＋ Add section” below it |
| 🖥 ▭ 📱 | Preview desktop / tablet / phone layouts |
| 🎨 Theme | Brand colours, fonts, corner roundness (applies everywhere) |
| ⚙ Settings | Page names & Google title/description, create/delete pages, WhatsApp number, announcement bar, floating quote card, password |
| ✉ Enquiries | Messages sent from the contact form |
| 🕘 History | Every save keeps the previous version (last 40) — one click to restore |

**Ctrl+S** saves & publishes, **Ctrl+Z / Ctrl+Y** undo/redo. Nothing goes live until you save.

## How it fits together

- All content lives in PostgreSQL as JSON documents: `global` (header, footer, contact, theme) and `page:<slug>`.
  Images are stored in the `media` table and served from `/api/media/:id`.
- The public pages and the editor render the **same React components**; in the editor every text/image/list
  becomes editable, so what you see while editing is exactly what visitors get.
- The browser only talks to Next.js; `/api/*` is proxied to Express (`BACKEND_URL` in `frontend/.env.local`).
- HTML from the editor is sanitised on the server before it's stored.
- `npm run seed -- --force` resets the website content to the starter version (the old content stays in History).

## Deploying

### Vercel (two projects from the same repo)

Both folders already contain a `vercel.json`. Create **two** Vercel projects and set each one's **Root Directory**:

**1. Backend** — Root Directory `backend` (Framework preset: *Other*)

Environment variables:

| Name | Value |
| --- | --- |
| `DATABASE_URL_2` | your Neon connection string |
| `JWT_SECRET` | a long random string |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | the admin login |
| `FRONTEND_ORIGIN` | the frontend URL, e.g. `https://sharma-engineering.vercel.app` |

Every request goes to `api/index.js`, which runs the Express app as a serverless function
(`src/server.js` is only for running locally or on a normal server). Check `https://<backend>.vercel.app/api/health`.
Run `npm run seed` once from your computer if the database is empty.

**2. Frontend** — Root Directory `frontend` (Framework preset: *Next.js*)

| Name | Value |
| --- | --- |
| `BACKEND_URL` | the backend URL, e.g. `https://sharma-engineering-api.vercel.app` (no trailing slash) |

Redeploy the frontend after changing `BACKEND_URL` — it's read at build time for the `/api` proxy.

Notes: Vercel limits request bodies to 4.5 MB, so uploads are capped at 4 MB per image (the editor uploads one image per request).
Images are stored in Postgres, so nothing is lost between serverless invocations.

### Other hosts

- Backend: any Node host (Render, Railway, a VPS): `npm start`. Set the same variables as above.
- Frontend: any Node host: set `BACKEND_URL`, then `npm run build && npm start`.
