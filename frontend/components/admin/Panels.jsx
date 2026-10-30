'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { DT_MEDIA } from '../edit/primitives';
import { SECTION_INFO, FONTS, makeSection } from '@/lib/templates';
import { SECTION_NAMES } from '../site/Section';
import { stripTags } from '@/lib/path';

const TITLES = { media: 'Media library', sections: 'Add a section', theme: 'Theme & fonts', settings: 'Settings', enquiries: 'Enquiries', history: 'Version history' };

export default function Panels(props) {
  const { panel, close, pick } = props;
  if (!panel) return null;
  return (
    <aside className="panel">
      <div className="panel-head">
        <h2>{pick ? 'Choose an image' : TITLES[panel]}</h2>
        <button className="a-icon" onClick={close} title="Close">✕</button>
      </div>
      <div className="panel-body">
        {panel === 'media' && <MediaPanel {...props} />}
        {panel === 'sections' && <SectionsPanel {...props} />}
        {panel === 'theme' && <ThemePanel {...props} />}
        {panel === 'settings' && <SettingsPanel {...props} />}
        {panel === 'enquiries' && <EnquiriesPanel {...props} />}
        {panel === 'history' && <HistoryPanel {...props} />}
      </div>
    </aside>
  );
}

/* ---------------- Media ---------------- */
function MediaPanel({ media, setMedia, upload, pick, onPicked, selection, setImage, notify, handleAuthError }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const [q, setQ] = useState('');
  const list = media.filter((m) => !q || `${m.filename} ${m.alt}`.toLowerCase().includes(q.toLowerCase()));

  const remove = async (m) => {
    if (!window.confirm('Delete this image from the library? Places that use it will show an empty image.')) return;
    try {
      await api(`/api/media/${m.id}`, { method: 'DELETE' });
      setMedia((all) => all.filter((x) => x.id !== m.id));
    } catch (err) {
      if (!handleAuthError(err)) notify(err.message, 'error');
    }
  };

  const choose = (m) => {
    const v = { src: m.url, alt: m.alt };
    if (pick) onPicked(v);
    else if (selection?.kind === 'image') setImage(selection.path, v);
  };

  return (
    <>
      {pick ? (
        <p className="p-note strong">Click an image to use it, or upload a new one.</p>
      ) : (
        <p className="p-note">
          <b>Drag</b> a photo onto the page: drop it <b>on an image</b> to replace it, or <b>on empty space</b> to place it freely and move it anywhere.
        </p>
      )}
      <div
        className={`dropzone ${over ? 'over' : ''}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setOver(false);
          const out = await upload(e.dataTransfer.files);
          if (pick && out[0]) onPicked(out[0]);
        }}
      >
        <b>⬆ Upload images</b>
        <span>Click or drop JPG, PNG, WebP (max 4 MB each)</span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={async (e) => {
            const out = await upload(e.target.files);
            e.target.value = '';
            if (pick && out[0]) onPicked(out[0]);
          }}
        />
      </div>
      <input className="p-input" placeholder={`Search ${media.length} images…`} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="media-grid">
        {list.map((m) => (
          <figure
            key={m.id}
            className="media-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DT_MEDIA, JSON.stringify({ src: m.url, alt: m.alt }));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => choose(m)}
            title={m.alt || m.filename}
          >
            <img src={m.url} alt={m.alt} loading="lazy" draggable={false} />
            <button className="media-del" title="Delete" onClick={(e) => { e.stopPropagation(); remove(m); }}>✕</button>
          </figure>
        ))}
      </div>
    </>
  );
}

/* ---------------- Add section ---------------- */
function SectionsPanel({ insertSection, addAt, doc }) {
  const n = doc.page.sections?.length || 0;
  return (
    <>
      <p className="p-note">
        {addAt == null || addAt >= n ? 'The new section will be added at the end of the page.' : `The new section will be inserted at position ${addAt + 1}.`} You can move it afterwards with ↑ ↓.
      </p>
      <div className="sec-list">
        {SECTION_INFO.map(([type, desc]) => (
          <button key={type} className="sec-card" onClick={() => insertSection(type)}>
            <b>{SECTION_NAMES[type]}</b>
            <span>{desc}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------- Theme ---------------- */
const PRESETS = [
  ['Sharma orange', { primary: '#E8590C', dark: '#121417', light: '#F5F2EC' }],
  ['Steel blue', { primary: '#1D6FD8', dark: '#0E1726', light: '#EEF3F9' }],
  ['Industrial green', { primary: '#178A55', dark: '#0F1A15', light: '#EEF5F0' }],
  ['Signal red', { primary: '#D7263D', dark: '#151213', light: '#F7F1EF' }],
];
const COLORS = [
  ['primary', 'Accent / brand colour'],
  ['dark', 'Dark backgrounds'],
  ['light', 'Light backgrounds'],
  ['paper', 'Page background'],
  ['ink', 'Main text'],
  ['muted', 'Secondary text'],
];

function ThemePanel({ doc, update }) {
  const t = doc.global.theme || {};
  const set = (k, v, history = 'push') => update(`global.theme.${k}`, v, { history });
  return (
    <>
      <h3 className="p-h">Quick presets</h3>
      <div className="presets">
        {PRESETS.map(([name, p]) => (
          <button key={name} className="preset" onClick={() => update('global.theme', { ...t, ...p })}>
            <span style={{ background: p.primary }} /><span style={{ background: p.dark }} /><span style={{ background: p.light }} />
            {name}
          </button>
        ))}
      </div>
      <h3 className="p-h">Colours</h3>
      {COLORS.map(([k, label]) => (
        <label key={k} className="p-row">
          <span>{label}</span>
          <input type="color" value={t[k] || '#000000'} onChange={(e) => set(k, e.target.value, 'merge')} />
          <code>{t[k]}</code>
        </label>
      ))}
      <h3 className="p-h">Fonts</h3>
      <label className="p-row col">
        <span>Headings</span>
        <select value={t.headingFont || 'Inter Tight'} onChange={(e) => set('headingFont', e.target.value)} style={{ fontFamily: t.headingFont }}>
          {FONTS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </label>
      <label className="p-row col">
        <span>Body text</span>
        <select value={t.bodyFont || 'Inter'} onChange={(e) => set('bodyFont', e.target.value)}>
          {FONTS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </label>
      <h3 className="p-h">Corners</h3>
      <label className="p-row">
        <span>Roundness</span>
        <input type="range" min="0" max="32" value={t.radius ?? 14} onChange={(e) => set('radius', Number(e.target.value), 'merge')} />
        <code>{t.radius ?? 14}px</code>
      </label>
    </>
  );
}

/* ---------------- Settings ---------------- */
function SettingsPanel({ doc, update, slug, pages, loadPages, switchPage, notify, handleAuthError }) {
  const g = doc.global;
  const pg = doc.page;
  const [newTitle, setNewTitle] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const createPage = async () => {
    const title = newTitle.trim();
    const s = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!s) return notify('Please enter a page name', 'error');
    if (pages.some((p) => p.slug === s) || s === 'admin') return notify('A page with that address already exists', 'error');
    try {
      await api(`/api/site/pages/${s}`, {
        method: 'PUT',
        body: {
          title,
          seo: { title: `${title} | ${stripTags(g.siteName)}`, description: '' },
          sections: [{ ...makeSection('pageHeader'), title: `${title}.` }, makeSection('textImage'), makeSection('cta')],
        },
      });
      await loadPages();
      setNewTitle('');
      notify(`Page /${s} created`);
      switchPage(s);
    } catch (err) {
      if (!handleAuthError(err)) notify(err.message, 'error');
    }
  };

  const deletePage = async () => {
    if (!window.confirm(`Delete the page /${slug}? This cannot be undone from the editor.`)) return;
    try {
      await api(`/api/site/pages/${slug}`, { method: 'DELETE' });
      await loadPages();
      notify('Page deleted');
      switchPage('home');
    } catch (err) {
      if (!handleAuthError(err)) notify(err.message, 'error');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api('/api/auth/password', { method: 'POST', body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      notify('Password changed');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <h3 className="p-h">This page ({slug === 'home' ? '/' : `/${slug}`})</h3>
      <label className="p-row col"><span>Page name</span><input className="p-input" value={pg.title || ''} onChange={(e) => update('page.title', e.target.value, { history: 'merge' })} /></label>
      <label className="p-row col"><span>Google title</span><input className="p-input" value={pg.seo?.title || ''} onChange={(e) => update('page.seo.title', e.target.value, { history: 'merge' })} /></label>
      <label className="p-row col"><span>Google description</span><textarea className="p-input" rows={3} value={pg.seo?.description || ''} onChange={(e) => update('page.seo.description', e.target.value, { history: 'merge' })} /></label>
      {slug !== 'home' && <button className="a-btn danger" onClick={deletePage}>Delete this page</button>}

      <h3 className="p-h">Pages</h3>
      <ul className="p-pages">
        {pages.map((p) => (
          <li key={p.slug}>
            <button className="linkish" onClick={() => switchPage(p.slug)}>{p.title || p.slug}</button>
            <code>{p.slug === 'home' ? '/' : `/${p.slug}`}</code>
          </li>
        ))}
      </ul>
      <div className="p-inline">
        <input className="p-input" placeholder="New page name, e.g. About us" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createPage()} />
        <button className="a-btn a-primary" onClick={createPage}>Create</button>
      </div>
      <p className="p-note">Add the new page to the menu by clicking “＋ Link” in the header.</p>

      <h3 className="p-h">Website</h3>
      <label className="p-row col"><span>Company name (browser tab & Google)</span><input className="p-input" value={stripTags(g.siteName)} onChange={(e) => update('global.siteName', e.target.value, { history: 'merge' })} /></label>
      <label className="p-row col"><span>WhatsApp number (with country code, digits only)</span><input className="p-input" value={g.contact?.whatsapp || ''} onChange={(e) => update('global.contact.whatsapp', e.target.value.replace(/[^\d]/g, ''), { history: 'merge' })} placeholder="919876543210" /></label>
      <label className="p-check"><input type="checkbox" checked={!!g.announcement?.show} onChange={(e) => update('global.announcement.show', e.target.checked)} /> Show announcement bar above the menu</label>
      <label className="p-check"><input type="checkbox" checked={!!g.floatingCta?.show} onChange={(e) => update('global.floatingCta.show', e.target.checked)} /> Show floating “Get a quote” card</label>
      <p className="p-note">Logo: click the image spot next to the company name in the header to upload a logo.</p>

      <h3 className="p-h">Account</h3>
      <form onSubmit={changePassword} className="p-form">
        <input className="p-input" type="password" placeholder="Current password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        <input className="p-input" type="password" placeholder="New password (min 8 characters)" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        <button className="a-btn">Change password</button>
      </form>
    </>
  );
}

/* ---------------- Enquiries ---------------- */
function EnquiriesPanel({ notify, handleAuthError }) {
  const [rows, setRows] = useState(null);
  const load = () => api('/api/enquiries').then(setRows).catch((err) => !handleAuthError(err) && notify(err.message, 'error'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mark = async (r) => {
    await api(`/api/enquiries/${r.id}`, { method: 'PATCH', body: { is_read: !r.is_read } });
    setRows((all) => all.map((x) => (x.id === r.id ? { ...x, is_read: !r.is_read } : x)));
  };
  const remove = async (r) => {
    if (!window.confirm(`Delete the enquiry from ${r.name}?`)) return;
    await api(`/api/enquiries/${r.id}`, { method: 'DELETE' });
    setRows((all) => all.filter((x) => x.id !== r.id));
  };

  if (!rows) return <p className="p-note">Loading…</p>;
  if (!rows.length) return <p className="p-note">No enquiries yet. Messages sent from the website’s contact form will appear here.</p>;
  return (
    <div className="enq-list">
      {rows.map((r) => (
        <article key={r.id} className={`enq ${r.is_read ? '' : 'unread'}`}>
          <header>
            <b>{r.name}</b>
            <time>{new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>
          </header>
          {r.service && <span className="enq-svc">{r.service}</span>}
          <div className="enq-contact">
            {r.phone && <a href={`tel:${r.phone}`}>📞 {r.phone}</a>}
            {r.email && <a href={`mailto:${r.email}`}>✉ {r.email}</a>}
          </div>
          {r.message && <p>{r.message}</p>}
          <footer>
            <button className="a-btn" onClick={() => mark(r)}>{r.is_read ? 'Mark unread' : 'Mark read'}</button>
            <button className="a-btn danger" onClick={() => remove(r)}>Delete</button>
          </footer>
        </article>
      ))}
    </div>
  );
}

/* ---------------- History ---------------- */
function HistoryPanel({ slug, loadDoc, notify, handleAuthError }) {
  const [which, setWhich] = useState(`page:${slug}`);
  const [rows, setRows] = useState(null);
  useEffect(() => {
    setRows(null);
    api(`/api/site/revisions?key=${encodeURIComponent(which)}`).then(setRows).catch((err) => !handleAuthError(err) && notify(err.message, 'error'));
  }, [which, notify, handleAuthError]);

  const restore = async (r) => {
    if (!window.confirm('Restore this version? The current version is kept in history, so you can switch back.')) return;
    try {
      await api(`/api/site/revisions/${r.id}/restore`, { method: 'POST' });
      notify('Version restored and published');
      loadDoc(slug);
    } catch (err) {
      if (!handleAuthError(err)) notify(err.message, 'error');
    }
  };

  return (
    <>
      <div className="seg-tabs">
        <button className={which === `page:${slug}` ? 'on' : ''} onClick={() => setWhich(`page:${slug}`)}>This page</button>
        <button className={which === 'global' ? 'on' : ''} onClick={() => setWhich('global')}>Header, footer & theme</button>
      </div>
      <p className="p-note">Each time you save, the previous version is kept here (last 40).</p>
      {!rows ? <p className="p-note">Loading…</p> : !rows.length ? <p className="p-note">No earlier versions yet.</p> : (
        <ul className="rev-list">
          {rows.map((r) => (
            <li key={r.id}>
              <span>{new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <button className="a-btn" onClick={() => restore(r)}>Restore</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
