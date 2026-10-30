'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteRenderer from '../site/SiteRenderer';
import { EditProvider } from '../edit/EditContext';
import { DT_MEDIA, DT_PATH } from '../edit/primitives';
import Ribbon from './Ribbon';
import Panels from './Panels';
import { api, getToken, setToken } from '@/lib/api';
import { getIn, setIn, uid, cloneFresh, img as toImg } from '@/lib/path';
import { makeSection } from '@/lib/templates';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sectionOf = (path) => path?.match(/^page\.sections\.\d+/)?.[0];

export default function Editor() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [slug, setSlug] = useState('home');
  const [doc, setDoc] = useState(null);
  const docRef = useRef(null);
  const saved = useRef({ global: '', page: '' });
  const hist = useRef({ past: [], future: [], lastKey: null, lastTime: 0 });
  const [selection, setSelection] = useState(null);
  const selRef = useRef(null);
  selRef.current = selection;
  const [panel, setPanel] = useState(null);
  const [addAt, setAddAt] = useState(null);
  const [pick, setPick] = useState(null); // callback while choosing an image from the library
  const [device, setDevice] = useState('desktop');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');

  const notify = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind, t: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAuthError = useCallback(
    (err) => {
      if (err?.status === 401) {
        setToken(null);
        router.replace('/admin/login');
        return true;
      }
      return false;
    },
    [router]
  );

  /* ---------------- loading ---------------- */
  const loadMedia = useCallback(() => api('/api/media').then(setMedia).catch(handleAuthError), [handleAuthError]);
  const loadPages = useCallback(() => api('/api/site/pages').then(setPages), []);

  const loadDoc = useCallback(async (s) => {
    setError('');
    try {
      const [global, page] = await Promise.all([api('/api/site/global'), api(`/api/site/pages/${s}`)]);
      const d = { global, page };
      docRef.current = d;
      saved.current = { global: JSON.stringify(global), page: JSON.stringify(page) };
      hist.current = { past: [], future: [], lastKey: null, lastTime: 0 };
      setSelection(null);
      setDoc(d);
      setSlug(s);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    api('/api/auth/me')
      .then((u) => {
        setUser(u);
        const initial = new URLSearchParams(window.location.search).get('page') || 'home';
        loadDoc(initial);
        loadPages();
        loadMedia();
      })
      .catch((err) => {
        if (!handleAuthError(err)) setError(err.message);
      });
  }, [router, loadDoc, loadPages, loadMedia, handleAuthError]);

  /* ---------------- history-aware updates ---------------- */
  const commit = useCallback((next, { history = 'push', key = null } = {}) => {
    const h = hist.current;
    const now = Date.now();
    const merge = history === 'merge' && h.lastKey === key && now - h.lastTime < 1500;
    if (history !== 'none' && !merge) {
      h.past.push(docRef.current);
      if (h.past.length > 150) h.past.shift();
      h.future = [];
    }
    h.lastKey = history === 'merge' ? key : null;
    h.lastTime = now;
    docRef.current = next;
    setDoc(next);
  }, []);

  const update = useCallback((path, value, opts = {}) => commit(setIn(docRef.current, path, value), { ...opts, key: path }), [commit]);
  const get = (path) => getIn(docRef.current, path);

  const undo = useCallback(() => {
    const h = hist.current;
    if (!h.past.length) return;
    h.future.push(docRef.current);
    docRef.current = h.past.pop();
    h.lastKey = null;
    setDoc(docRef.current);
  }, []);
  const redo = useCallback(() => {
    const h = hist.current;
    if (!h.future.length) return;
    h.past.push(docRef.current);
    docRef.current = h.future.pop();
    h.lastKey = null;
    setDoc(docRef.current);
  }, []);

  /* ---------------- saving ---------------- */
  const isDirty = !!doc && (JSON.stringify(doc.global) !== saved.current.global || JSON.stringify(doc.page) !== saved.current.page);

  const save = useCallback(async () => {
    const d = docRef.current;
    if (!d) return;
    setSaving(true);
    try {
      const g = JSON.stringify(d.global);
      const p = JSON.stringify(d.page);
      const jobs = [];
      if (g !== saved.current.global) jobs.push(api('/api/site/global', { method: 'PUT', body: d.global }));
      if (p !== saved.current.page) jobs.push(api(`/api/site/pages/${slug}`, { method: 'PUT', body: d.page }));
      await Promise.all(jobs);
      saved.current = { global: g, page: p };
      setDoc({ ...d }); // re-render to refresh the dirty flag
      docRef.current = d;
      notify(jobs.length ? 'Saved — your website is updated' : 'No changes to save');
    } catch (err) {
      if (!handleAuthError(err)) notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [slug, notify, handleAuthError]);

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      } else if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        setSelection(null);
        setPick(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.closest?.('input,textarea,select,[contenteditable="true"]')) {
        const sel = selRef.current;
        if (sel?.kind === 'float') {
          e.preventDefault();
          const list = sel.path.replace(/\.\d+$/, '');
          const i = Number(sel.path.split('.').pop());
          update(list, (getIn(docRef.current, list) || []).filter((_, j) => j !== i));
          setSelection(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, undo, redo, update]);

  useEffect(() => {
    const warn = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  /* ---------------- media ---------------- */
  const upload = useCallback(
    async (files) => {
      const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
      if (!list.length) return [];
      const tooBig = list.filter((f) => f.size > 4 * 1024 * 1024);
      if (tooBig.length) notify(`${tooBig.map((f) => f.name).join(', ')} is over 4 MB — please resize it first`, 'error');
      const ok = list.filter((f) => f.size <= 4 * 1024 * 1024);
      if (!ok.length) return [];
      notify(`Uploading ${ok.length} image${ok.length > 1 ? 's' : ''}…`);
      try {
        // One file per request keeps each request under the 4.5 MB body limit on Vercel.
        const out = [];
        for (const f of ok) {
          const form = new FormData();
          form.append('files', f);
          out.push(...(await api('/api/media', { method: 'POST', form })));
        }
        setMedia((m) => [...out, ...m]);
        notify('Upload complete');
        return out.map((m) => ({ src: m.url, alt: m.alt }));
      } catch (err) {
        if (!handleAuthError(err)) notify(err.message, 'error');
        return [];
      }
    },
    [notify, handleAuthError]
  );

  const openPicker = (cb) => {
    setPick(() => cb);
    setPanel('media');
  };

  const setImage = (path, m) => {
    const cur = toImg(get(path));
    update(path, { ...cur, src: m.src, alt: m.alt ?? cur.alt ?? '' });
  };

  const addFloatAt = (secPath, m, x = 38, y = 30) => {
    const floats = get(`${secPath}.floats`) || [];
    update(`${secPath}.floats`, [
      ...floats,
      { id: uid('f'), src: m.src, alt: m.alt || '', x: clamp(x - 11, 0, 90), y: clamp(y - 8, 0, 92), w: 22, z: 3, r: 0, round: true, shadow: true },
    ]);
    setSelection({ kind: 'float', path: `${secPath}.floats.${floats.length}` });
  };

  const readMedia = (dt) => {
    const raw = dt.getData(DT_MEDIA);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  /* ---------------- the API every editable element talks to ---------------- */
  const ed = {
    editing: !preview,
    selection,
    select: setSelection,
    update,
    moveItem(list, i, dir) {
      const arr = [...(get(list) || [])];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      update(list, arr);
      setSelection(null);
    },
    duplicateItem(list, i) {
      const arr = [...(get(list) || [])];
      arr.splice(i + 1, 0, cloneFresh(arr[i]));
      update(list, arr);
      setSelection(null);
    },
    removeItem(list, i, confirmMsg) {
      if (confirmMsg && !window.confirm(confirmMsg)) return;
      update(list, (get(list) || []).filter((_, j) => j !== i));
      setSelection(null);
    },
    addItem(list, items, make) {
      const arr = get(list) || [];
      const item = make ? { id: uid('i'), ...make() } : arr.length ? cloneFresh(arr[arr.length - 1]) : { id: uid('i') };
      update(list, [...arr, item]);
    },
    editLink(path, current) {
      const v = window.prompt('Where should this link go?\nExamples: /#contact · /projects · https://… · tel:+91… · mailto:…', current || '');
      if (v !== null) update(path, v.trim());
    },
    replaceImage(path) {
      openPicker((m) => setImage(path, m));
    },
    async dropOnImage(path, dt) {
      const m = readMedia(dt);
      if (m) return setImage(path, m);
      const from = dt.getData(DT_PATH);
      if (from && from !== path) {
        const d = docRef.current;
        const a = toImg(getIn(d, from));
        const b = toImg(getIn(d, path));
        let next = setIn(d, path, { ...b, src: a.src, alt: a.alt || '' });
        next = setIn(next, from, { ...a, src: b.src, alt: b.alt || '' });
        commit(next);
        notify('Images swapped');
        return;
      }
      if (dt.files?.length) {
        const [first] = await upload(dt.files);
        if (first) setImage(path, first);
      }
    },
    async dropOnSection(secPath, dt, x, y) {
      const m = readMedia(dt);
      if (m) return addFloatAt(secPath, m, x, y);
      const from = dt.getData(DT_PATH);
      if (from) {
        const src = toImg(get(from));
        if (src.src) addFloatAt(secPath, src, x, y);
        return;
      }
      if (dt.files?.length) {
        const out = await upload(dt.files);
        out.forEach((o, k) => addFloatAt(secPath, o, x + k * 4, y + k * 4));
      }
    },
    addFloat(secPath) {
      openPicker((m) => addFloatAt(secPath, m));
    },
    openAddSection(at) {
      setAddAt(at);
      setPanel('sections');
    },
  };

  const insertSection = (type) => {
    const list = get('page.sections') || [];
    const at = addAt ?? list.length;
    const next = [...list];
    next.splice(at, 0, makeSection(type));
    update('page.sections', next);
    setPanel(null);
    setSelection({ kind: 'section', path: `page.sections.${at}` });
    setTimeout(() => document.querySelectorAll('.canvas .sec')[at]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const switchPage = (s) => {
    if (s === slug) return;
    if (isDirty && !window.confirm('You have unsaved changes on this page. Discard them?')) return;
    window.history.replaceState(null, '', `/admin?page=${s}`);
    loadDoc(s);
  };

  const logout = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    setToken(null);
    router.replace('/admin/login');
  };

  if (error && !doc) {
    return (
      <div className="a-center">
        <p>Could not load the editor: {error}</p>
        <button className="a-btn" onClick={() => location.reload()}>Retry</button>
      </div>
    );
  }
  if (!doc || !user) return <div className="a-center"><div className="a-spinner" /> Loading editor…</div>;

  return (
    <div className="admin">
      <Ribbon
        ed={ed}
        doc={doc}
        get={get}
        update={update}
        selection={selection}
        setSelection={setSelection}
        pages={pages}
        slug={slug}
        switchPage={switchPage}
        canUndo={hist.current.past.length > 0}
        canRedo={hist.current.future.length > 0}
        undo={undo}
        redo={redo}
        device={device}
        setDevice={setDevice}
        preview={preview}
        setPreview={setPreview}
        panel={panel}
        setPanel={(p) => { setPick(null); setPanel(p); }}
        openAddSection={() => ed.openAddSection(null)}
        isDirty={isDirty}
        saving={saving}
        save={save}
        user={user}
        logout={logout}
        openPicker={openPicker}
        setImage={setImage}
        addFloatAt={addFloatAt}
        sectionOf={sectionOf}
      />
      <div className="a-body">
        <div
          className="canvas"
          onClick={() => setSelection(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
        >
          <div className={`frame frame-${device}`} onClick={(e) => e.stopPropagation()}>
            <EditProvider value={ed}>
              <SiteRenderer global={doc.global} page={doc.page} />
            </EditProvider>
          </div>
        </div>
        <Panels
          panel={panel}
          close={() => { setPanel(null); setPick(null); }}
          pick={pick}
          onPicked={(m) => { pick?.(m); setPick(null); setPanel(null); }}
          media={media}
          setMedia={setMedia}
          upload={upload}
          insertSection={insertSection}
          addAt={addAt}
          doc={doc}
          update={update}
          slug={slug}
          pages={pages}
          loadPages={loadPages}
          switchPage={switchPage}
          loadDoc={loadDoc}
          notify={notify}
          handleAuthError={handleAuthError}
          selection={selection}
          setImage={setImage}
        />
      </div>
      {toast && <div className={`a-toast ${toast.kind}`} key={toast.t}>{toast.msg}</div>}
    </div>
  );
}
