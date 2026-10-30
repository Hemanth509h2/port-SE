'use client';
import { useEffect, useRef, useState } from 'react';
import { FONTS } from '@/lib/templates';
import { img as toImg } from '@/lib/path';

const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96];
const keep = (e) => e.preventDefault(); // keep focus/selection inside the text being edited

/* Remembers the last text selection inside an editable field so toolbar
   controls that take focus (colour pickers, dropdowns) can still apply to it. */
function useTextSelection() {
  const saved = useRef(null);
  const [state, setState] = useState({ active: false });
  useEffect(() => {
    const onChange = () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const node = sel.anchorNode;
      const el = (node?.nodeType === 1 ? node : node?.parentElement)?.closest?.('.se-text');
      if (!el) return;
      saved.current = { el, range: sel.getRangeAt(0).cloneRange() };
      setState({
        active: true,
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        ul: document.queryCommandState('insertUnorderedList'),
        ol: document.queryCommandState('insertOrderedList'),
      });
    };
    document.addEventListener('selectionchange', onChange);
    return () => document.removeEventListener('selectionchange', onChange);
  }, []);

  const restore = () => {
    const s = saved.current;
    if (!s || !s.el.isConnected) return null;
    s.el.focus({ preventScroll: true });
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(s.range);
    return s.el;
  };
  return { state, restore, saved };
}

export default function Ribbon(props) {
  const {
    doc, get, update, selection, setSelection, pages, slug, switchPage, canUndo, canRedo, undo, redo, device, setDevice,
    preview, setPreview, panel, setPanel, openAddSection, isDirty, saving, save, user, logout, openPicker, setImage, addFloatAt, sectionOf,
  } = props;
  const { state: fmt, restore } = useTextSelection();

  const exec = (cmd, val = null, css = true) => {
    const el = restore();
    if (!el) return;
    document.execCommand('styleWithCSS', false, css);
    document.execCommand(cmd, false, val);
  };

  // execCommand('fontSize') only knows sizes 1–7; apply 7, then swap those tags for real pixel sizes.
  const fontSize = (px) => {
    const el = restore();
    if (!el || !px) return;
    document.execCommand('styleWithCSS', false, false);
    document.execCommand('fontSize', false, '7');
    el.querySelectorAll('font[size="7"]').forEach((f) => {
      const span = document.createElement('span');
      span.style.fontSize = `${px}px`;
      span.innerHTML = f.innerHTML;
      f.replaceWith(span);
    });
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const link = () => {
    const url = window.prompt('Link address (https://…, /projects, tel:…, mailto:…)', 'https://');
    if (url) exec('createLink', url, false);
  };

  const theme = doc.global.theme || {};
  const swatches = [theme.primary, theme.ink, theme.dark, theme.muted, '#ffffff', '#1d4ed8', '#15803d', '#b91c1c'].filter(Boolean);

  return (
    <div className="ribbon">
      {/* ---------- top bar ---------- */}
      <div className="r-top">
        <div className="r-brand"><b>SE</b> Editor</div>
        <label className="r-page">
          <span>Page</span>
          <select value={slug} onChange={(e) => (e.target.value === '__new' ? setPanel('settings') : switchPage(e.target.value))}>
            {pages.map((p) => <option key={p.slug} value={p.slug}>{p.title || p.slug} ({p.slug === 'home' ? '/' : `/${p.slug}`})</option>)}
            <option value="__new">＋ New page…</option>
          </select>
        </label>
        <div className="r-group">
          <button className="a-icon" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>↶</button>
          <button className="a-icon" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo}>↷</button>
        </div>
        <div className="r-group seg">
          {[['desktop', '🖥', 'Desktop'], ['tablet', '▭', 'Tablet'], ['mobile', '📱', 'Mobile']].map(([d, icon, label]) => (
            <button key={d} className={device === d ? 'on' : ''} title={`${label} view`} onClick={() => setDevice(d)}>{icon}</button>
          ))}
        </div>
        <button className={`a-btn ${preview ? 'on' : ''}`} onClick={() => { setPreview(!preview); setSelection(null); }}>{preview ? '✎ Back to editing' : '👁 Preview'}</button>
        <div className="r-spacer" />
        <div className="r-group">
          <button className="a-btn" onClick={openAddSection}>＋ Section</button>
          {[['media', '🖼 Media'], ['theme', '🎨 Theme'], ['settings', '⚙ Settings'], ['enquiries', '✉ Enquiries'], ['history', '🕘 History']].map(([k, label]) => (
            <button key={k} className={`a-btn ${panel === k ? 'on' : ''}`} onClick={() => setPanel(panel === k ? null : k)}>{label}</button>
          ))}
        </div>
        <a className="a-btn" href={slug === 'home' ? '/' : `/${slug}`} target="_blank" rel="noreferrer">View site ↗</a>
        <button className={`a-btn a-primary ${isDirty ? 'pulse' : ''}`} disabled={saving} onClick={save} title="Save & publish (Ctrl+S)">
          {saving ? 'Saving…' : isDirty ? 'Save & publish' : '✓ Saved'}
        </button>
        <button className="a-icon" title={`Signed in as ${user.username} — sign out`} onClick={logout}>⎋</button>
      </div>

      {/* ---------- formatting + contextual tools ---------- */}
      {!preview && (
        <div className="r-tools">
          <div className={`r-fmt ${fmt.active ? '' : 'idle'}`} title={fmt.active ? '' : 'Click any text on the page to start editing'}>
            <select defaultValue="" onChange={(e) => { exec('fontName', e.target.value); e.target.value = ''; }} title="Font">
              <option value="" disabled>Font</option>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select defaultValue="" onChange={(e) => { fontSize(Number(e.target.value)); e.target.value = ''; }} title="Font size" className="w-size">
              <option value="" disabled>Size</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
            <span className="r-sep" />
            <button onMouseDown={keep} className={fmt.bold ? 'on' : ''} onClick={() => exec('bold')} title="Bold (Ctrl+B)"><b>B</b></button>
            <button onMouseDown={keep} className={fmt.italic ? 'on' : ''} onClick={() => exec('italic')} title="Italic (Ctrl+I)"><i>I</i></button>
            <button onMouseDown={keep} className={fmt.underline ? 'on' : ''} onClick={() => exec('underline')} title="Underline (Ctrl+U)"><u>U</u></button>
            <button onMouseDown={keep} className={fmt.strike ? 'on' : ''} onClick={() => exec('strikeThrough')} title="Strikethrough"><s>S</s></button>
            <span className="r-sep" />
            <span className="r-colors" title="Text colour">
              <span className="r-lbl">A</span>
              {swatches.map((c) => (
                <button key={c} onMouseDown={keep} className="sw" style={{ background: c }} onClick={() => exec('foreColor', c)} title={c} />
              ))}
              <input type="color" onChange={(e) => exec('foreColor', e.target.value)} title="Custom colour" />
            </span>
            <span className="r-colors" title="Highlight">
              <span className="r-lbl hl">ab</span>
              <input type="color" defaultValue="#fff3a3" onChange={(e) => exec('hiliteColor', e.target.value)} title="Highlight colour" />
            </span>
            <span className="r-sep" />
            <button onMouseDown={keep} onClick={() => exec('justifyLeft')} title="Align left">⯇</button>
            <button onMouseDown={keep} onClick={() => exec('justifyCenter')} title="Center">≡</button>
            <button onMouseDown={keep} onClick={() => exec('justifyRight')} title="Align right">⯈</button>
            <button onMouseDown={keep} className={fmt.ul ? 'on' : ''} onClick={() => exec('insertUnorderedList')} title="Bullet list">•≡</button>
            <button onMouseDown={keep} className={fmt.ol ? 'on' : ''} onClick={() => exec('insertOrderedList')} title="Numbered list">1≡</button>
            <span className="r-sep" />
            <button onMouseDown={keep} onClick={link} title="Insert link">🔗</button>
            <button onMouseDown={keep} onClick={() => exec('unlink')} title="Remove link">⛓̸</button>
            <button onMouseDown={keep} onClick={() => exec('removeFormat')} title="Clear formatting">⌫ Clear</button>
          </div>
          <Context
            selection={selection}
            setSelection={setSelection}
            get={get}
            update={update}
            openPicker={openPicker}
            setImage={setImage}
            addFloatAt={addFloatAt}
            sectionOf={sectionOf}
          />
        </div>
      )}
    </div>
  );
}

/* Tools for whatever is selected: an image, a free-floating image or a section. */
function Context({ selection, setSelection, get, update, openPicker, setImage, addFloatAt, sectionOf }) {
  if (!selection || selection.kind === 'text') {
    return <div className="r-ctx hint">Tip: click text to type · click an image to change it · drag images to move or swap them · drag photos from 🖼 Media onto the page</div>;
  }
  const { kind, path } = selection;
  const v = get(path);
  if (v === undefined) return null;

  if (kind === 'image') {
    const im = toImg(v);
    const sec = sectionOf(path);
    return (
      <div className="r-ctx">
        <span className="r-ctx-title">Image</span>
        {im.src && <img className="r-thumb" src={im.src} alt="" />}
        <button className="a-btn" onClick={() => openPicker((m) => setImage(path, m))}>Replace…</button>
        <button className="a-btn" onClick={() => { const a = window.prompt('Describe this image (alt text, helps Google & screen readers)', im.alt || ''); if (a !== null) update(path, { ...im, alt: a }); }}>Alt text</button>
        <select value={im.fit || 'cover'} onChange={(e) => update(path, { ...im, fit: e.target.value })} title="How the image fills its box">
          <option value="cover">Fill box (crop)</option>
          <option value="contain">Fit whole image</option>
        </select>
        <select value={im.pos || 'center'} onChange={(e) => update(path, { ...im, pos: e.target.value })} title="Which part stays visible when cropped">
          {['center', 'top', 'bottom', 'left', 'right'].map((x) => <option key={x} value={x}>Focus: {x}</option>)}
        </select>
        {sec && im.src && <button className="a-btn" title="Place a copy you can drag anywhere" onClick={() => addFloatAt(sec, im)}>⤢ Free copy</button>}
        <button className="a-btn danger" onClick={() => { update(path, { ...im, src: '' }); setSelection(null); }}>Remove</button>
      </div>
    );
  }

  if (kind === 'float') {
    const f = v;
    const list = path.replace(/\.\d+$/, '');
    const i = Number(path.split('.').pop());
    const set = (patch, history = 'push') => update(path, { ...f, ...patch }, { history });
    return (
      <div className="r-ctx">
        <span className="r-ctx-title">Free image</span>
        <button className="a-btn" onClick={() => openPicker((m) => set({ src: m.src, alt: m.alt || '' }))}>Replace…</button>
        <label className="r-range">Size<input type="range" min="4" max="100" value={Math.round(f.w)} onChange={(e) => set({ w: Number(e.target.value) }, 'merge')} /></label>
        <label className="r-range">Rotate<input type="range" min="-45" max="45" value={f.r || 0} onChange={(e) => set({ r: Number(e.target.value) }, 'merge')} /></label>
        <button className="a-icon" title="Bring forward" onClick={() => set({ z: (f.z || 2) + 1 })}>⬆</button>
        <button className="a-icon" title="Send backward" onClick={() => set({ z: Math.max(1, (f.z || 2) - 1) })}>⬇</button>
        <label className="r-check"><input type="checkbox" checked={!!f.round} onChange={(e) => set({ round: e.target.checked })} />Rounded</label>
        <label className="r-check"><input type="checkbox" checked={!!f.shadow} onChange={(e) => set({ shadow: e.target.checked })} />Shadow</label>
        <label className="r-check"><input type="checkbox" checked={!!f.hideMobile} onChange={(e) => set({ hideMobile: e.target.checked })} />Hide on phones</label>
        <button className="a-btn danger" onClick={() => { update(list, get(list).filter((_, j) => j !== i)); setSelection(null); }}>Delete</button>
      </div>
    );
  }

  if (kind === 'section') {
    const s = v;
    return (
      <div className="r-ctx">
        <span className="r-ctx-title">Section</span>
        <label className="r-color">Background<input type="color" value={s.bg || '#ffffff'} onChange={(e) => update(`${path}.bg`, e.target.value, { history: 'merge' })} /></label>
        {s.bg && <button className="a-icon" title="Reset background" onClick={() => update(`${path}.bg`, '')}>↺</button>}
        <label className="r-color">Text<input type="color" value={s.fg || '#16181b'} onChange={(e) => update(`${path}.fg`, e.target.value, { history: 'merge' })} /></label>
        {s.fg && <button className="a-icon" title="Reset text colour" onClick={() => update(`${path}.fg`, '')}>↺</button>}
        <select value={s.pad || 'normal'} onChange={(e) => update(`${path}.pad`, e.target.value)} title="Spacing">
          <option value="compact">Spacing: compact</option>
          <option value="normal">Spacing: normal</option>
          <option value="large">Spacing: large</option>
        </select>
        {s.type === 'textImage' && (
          <button className="a-btn" onClick={() => update(`${path}.variant`, s.variant === 'flip' ? '' : 'flip')}>⇄ Swap sides</button>
        )}
        <label className="r-anchor" title="Lets links like /#contact jump to this section">
          #<input value={s.anchor || ''} placeholder="anchor-id" onChange={(e) => update(`${path}.anchor`, e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), { history: 'merge' })} />
        </label>
        <button className="a-btn" onClick={() => openPicker((m) => addFloatAt(path, m))}>🖼 Add free image</button>
      </div>
    );
  }
  return null;
}
