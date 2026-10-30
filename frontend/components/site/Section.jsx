'use client';
import { useEdit } from '../edit/EditContext';
import { Floats, DT_MEDIA, DT_PATH } from '../edit/primitives';
import { cx } from '@/lib/path';

export const SECTION_NAMES = {
  hero: 'Hero banner',
  intro: 'About / intro',
  features: 'Feature cards',
  services: 'Services',
  applications: 'Applications list',
  stats: 'Numbers',
  projects: 'Projects',
  process: 'Process steps',
  gallery: 'Photo gallery',
  cta: 'Call to action',
  contact: 'Contact + form',
  pageHeader: 'Page header',
  textImage: 'Text + image',
  richText: 'Text block',
};

const PAD = { compact: '56px', normal: undefined, large: '150px' };

// Wraps every page section: background/colour overrides, free-floating images and editor controls.
export default function Section({ s, p, i, count, className, children, dark }) {
  const ed = useEdit();
  const style = {
    background: s.bg || undefined,
    color: s.fg || undefined,
    paddingTop: PAD[s.pad],
    paddingBottom: PAD[s.pad],
  };
  if (!ed.editing && s.hidden) return null;

  if (!ed.editing) {
    return (
      <section id={s.anchor || undefined} className={cx('sec', `sec-${s.type}`, dark && 'dark', className)} style={style}>
        {children}
        <Floats p={`${p}.floats`} items={s.floats} />
      </section>
    );
  }

  const selected = ed.selection?.path === p;
  return (
    <section
      id={s.anchor || undefined}
      className={cx('sec', `sec-${s.type}`, dark && 'dark', className, 'se-sec', selected && 'se-sec-selected', s.hidden && 'se-sec-hidden')}
      style={style}
      onClick={() => ed.select({ kind: 'section', path: p })}
      onDragOver={(e) => {
        const t = Array.from(e.dataTransfer.types);
        if (t.includes(DT_MEDIA) || t.includes(DT_PATH) || t.includes('Files')) {
          e.preventDefault();
          e.currentTarget.classList.add('se-sec-drop');
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove('se-sec-drop');
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('se-sec-drop');
        const r = e.currentTarget.getBoundingClientRect();
        ed.dropOnSection(p, e.dataTransfer, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
      }}
    >
      {children}
      <Floats p={`${p}.floats`} items={s.floats} />
      <div className="se-secbar" contentEditable={false} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.preventDefault()}>
        <span className="se-secname">{SECTION_NAMES[s.type] || s.type}{s.hidden ? ' · hidden' : ''}</span>
        <button type="button" title="Move up" disabled={i === 0} onClick={() => ed.moveItem('page.sections', i, -1)}>↑</button>
        <button type="button" title="Move down" disabled={i === count - 1} onClick={() => ed.moveItem('page.sections', i, 1)}>↓</button>
        <button type="button" title="Add a free image to this section" onClick={() => ed.addFloat(p)}>🖼</button>
        <button type="button" title="Section style" onClick={() => ed.select({ kind: 'section', path: p })}>🎨</button>
        <button type="button" title="Duplicate" onClick={() => ed.duplicateItem('page.sections', i)}>⧉</button>
        <button type="button" title={s.hidden ? 'Show' : 'Hide'} onClick={() => ed.update(`${p}.hidden`, !s.hidden)}>{s.hidden ? '🚫' : '👁'}</button>
        <button type="button" title="Delete section" className="danger" onClick={() => ed.removeItem('page.sections', i, 'Delete this section?')}>✕</button>
      </div>
      <button type="button" className="se-addsec" contentEditable={false} onClick={(e) => { e.stopPropagation(); ed.openAddSection(i + 1); }}>
        ＋ Add section
      </button>
    </section>
  );
}
