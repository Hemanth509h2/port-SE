'use client';
import { useEffect, useState } from 'react';
import { T, Pic, L, Item, AddItem } from '../edit/primitives';
import { useEdit } from '../edit/EditContext';
import { cx, img as toImg, stripTags } from '@/lib/path';

function Brand({ g }) {
  const ed = useEdit();
  const logo = toImg(g.logo);
  const body = (
    <>
      {(logo.src || ed.editing) && <Pic p="global.logo" v={g.logo} className="logo-img" />}
      <T className="brand-text" p="global.brand" v={g.brand} placeholder="Company name" />
    </>
  );
  return ed.editing ? <div className="brand">{body}</div> : <a href="/" className="brand" aria-label={stripTags(g.siteName)}>{body}</a>;
}

export function Header({ g }) {
  const ed = useEdit();
  const [open, setOpen] = useState(false);
  const a = g.announcement || {};
  const links = g.nav?.links || [];
  return (
    <>
      {(a.show || ed.editing) && (
        <div className={cx('announce', !a.show && 'se-sec-hidden')}>
          <div className="wrap announce-inner">
            <T className="announce-tag" p="global.announcement.tag" v={a.tag} />
            <div className="announce-copy">
              <T as="b" p="global.announcement.title" v={a.title} />
              <T as="span" p="global.announcement.text" v={a.text} />
            </div>
            <L p="global.announcement.cta" v={a.cta} className="btn btn-dark btn-sm" />
          </div>
        </div>
      )}
      <header className="header">
        <div className="wrap header-inner">
          <Brand g={g} />
          <nav className={cx('nav', open && 'open')} aria-label="Main">
            {links.map((l, i) => (
              <Item key={l.id || i} list="global.nav.links" i={i} className="nav-item">
                <L p={`global.nav.links.${i}`} v={l} className="nav-link" />
              </Item>
            ))}
            <AddItem list="global.nav.links" items={links} label="Link" make={() => ({ label: 'New link', href: '/' })} />
            <L p="global.nav.cta" v={g.nav?.cta} className="btn btn-dark btn-sm nav-cta" />
          </nav>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>
        </div>
      </header>
    </>
  );
}

export function Footer({ g }) {
  const f = g.footer || {};
  const c = g.contact || {};
  const cols = f.columns || [];
  return (
    <footer className="footer dark">
      <div className="wrap footer-top">
        <div className="footer-brand">
          <T as="div" className="footer-logo" p="global.brand" v={g.brand} />
          <T as="p" p="global.footer.about" v={f.about} />
          <T as="p" className="muted" p="global.footer.cities" v={f.cities} />
          <p className="muted">
            <T p="global.contact.email" v={c.email} /> · <T p="global.contact.phone" v={c.phone} />
          </p>
        </div>
        {cols.map((col, i) => (
          <Item key={col.id || i} list="global.footer.columns" i={i} className="footer-col">
            <T as="h4" p={`global.footer.columns.${i}.title`} v={col.title} />
            <ul>
              {(col.links || []).map((l, j) => (
                <Item key={l.id || j} as="li" list={`global.footer.columns.${i}.links`} i={j}>
                  <L p={`global.footer.columns.${i}.links.${j}`} v={l} />
                </Item>
              ))}
            </ul>
            <AddItem list={`global.footer.columns.${i}.links`} items={col.links} label="Link" make={() => ({ label: 'New link', href: '/' })} />
          </Item>
        ))}
        <AddItem list="global.footer.columns" items={cols} label="Column" />
      </div>
      <div className="wrap footer-bottom">
        <T p="global.footer.bottom" v={f.bottom} />
      </div>
    </footer>
  );
}

export function FloatingCta({ g }) {
  const ed = useEdit();
  const fc = g.floatingCta || {};
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem('se_fc') === '1');
    } catch {
      setHidden(false);
    }
  }, []);
  const wa = String(g.contact?.whatsapp || '').replace(/\D/g, '');

  if (ed.editing) {
    return (
      <div className={cx('fcta fcta-edit', !fc.show && 'se-sec-hidden')}>
        <span className="se-note">Floating quote card (bottom-right of every page)</span>
        <T as="b" p="global.floatingCta.title" v={fc.title} />
        <T as="span" p="global.floatingCta.text" v={fc.text} />
        <L p="global.floatingCta.cta" v={fc.cta} className="btn btn-primary btn-sm" />
      </div>
    );
  }
  return (
    <>
      {wa && (
        <a className="wa" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" /></svg>
        </a>
      )}
      {fc.show && !hidden && (
        <div className="fcta">
          <button className="fcta-x" aria-label="Dismiss" onClick={() => { setHidden(true); try { sessionStorage.setItem('se_fc', '1'); } catch {} }}>✕</button>
          <b dangerouslySetInnerHTML={{ __html: fc.title || '' }} />
          <span dangerouslySetInnerHTML={{ __html: fc.text || '' }} />
          <L p="global.floatingCta.cta" v={fc.cta} className="btn btn-primary btn-sm" />
        </div>
      )}
    </>
  );
}
