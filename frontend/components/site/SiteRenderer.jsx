'use client';
import { SECTIONS } from './sections';
import { Header, Footer, FloatingCta } from './Chrome';
import { useEdit } from '../edit/EditContext';

const fontParam = (f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700;800`;

export function themeVars(t = {}) {
  return {
    '--primary': t.primary || '#E8590C',
    '--dark': t.dark || '#121417',
    '--light': t.light || '#F5F2EC',
    '--ink': t.ink || '#16181B',
    '--muted': t.muted || '#6B6E73',
    '--paper': t.paper || '#FFFFFF',
    '--radius': `${t.radius ?? 4}px`,
    '--font-h': `'${t.headingFont || 'Barlow'}', system-ui, sans-serif`,
    '--font-b': `'${t.bodyFont || 'Source Sans 3'}', system-ui, sans-serif`,
  };
}

export function FontLink({ theme = {} }) {
  const fonts = [...new Set([theme.headingFont || 'Barlow', theme.bodyFont || 'Source Sans 3'])];
  const href = `https://fonts.googleapis.com/css2?${fonts.map(fontParam).join('&')}&display=swap`;
  return <link rel="stylesheet" href={href} precedence="default" />;
}

// Renders a whole page (header, sections, footer). Used by the public site and inside the admin editor.
export default function SiteRenderer({ global: g, page }) {
  const ed = useEdit();
  const sections = page.sections || [];

  return (
    <>
      <FontLink theme={g.theme} />
      <div className={ed.editing ? 'site editing' : 'site'} style={themeVars(g.theme)}>
        <div className="site-c">
          <Header g={g} />
          <main>
            {sections.map((s, i) => {
              const Comp = SECTIONS[s.type];
              if (!Comp) return null;
              return <Comp key={s.id || i} s={s} p={`page.sections.${i}`} i={i} count={sections.length} global={g} />;
            })}
            {ed.editing && sections.length === 0 && (
              <div className="se-empty">
                <p>This page is empty.</p>
                <button className="se-additem" onClick={() => ed.openAddSection(0)}>＋ Add the first section</button>
              </div>
            )}
          </main>
          <Footer g={g} />
        </div>
        <FloatingCta g={g} />
      </div>
    </>
  );
}
