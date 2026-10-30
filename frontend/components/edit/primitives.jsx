'use client';
import { useLayoutEffect, useRef } from 'react';
import { useEdit } from './EditContext';
import { cx, img as toImg, stripTags } from '@/lib/path';

export const DT_PATH = 'application/x-se-path';
export const DT_MEDIA = 'application/x-se-media';
const hasType = (e, t) => Array.from(e.dataTransfer?.types || []).includes(t);

/* ------------------------------------------------------------------ */
/* T — editable rich text. Click and type, format from the ribbon.     */
/* ------------------------------------------------------------------ */
export function T({ as = 'span', p, v, className, style, placeholder }) {
  const ed = useEdit();
  if (!ed.editing) {
    if (v == null || v === '') return null;
    const Tag = as;
    return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: v }} />;
  }
  return <EditableText Tag={as} p={p} v={v} className={className} style={style} placeholder={placeholder} ed={ed} />;
}

function EditableText({ Tag, p, v, className, style, placeholder, ed }) {
  const ref = useRef(null);
  // Only touch the DOM when the value changed from outside (undo, restore) so the caret is preserved while typing.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== (v ?? '')) el.innerHTML = v ?? '';
  }, [v]);

  return (
    <Tag
      ref={ref}
      className={cx(className, 'se-text')}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-path={p}
      data-ph={placeholder || 'Type here…'}
      onInput={(e) => ed.update(p, e.currentTarget.innerHTML, { history: 'merge' })}
      onFocus={() => ed.select({ kind: 'text', path: p })}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const inList = window.getSelection()?.anchorNode?.parentElement?.closest('li');
          if (!inList) {
            e.preventDefault();
            document.execCommand('insertLineBreak');
          }
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Pic — editable image. Click to select, drag onto another image to   */
/* swap, drop from the media library to replace, drag into empty space */
/* of any section to place a free-floating copy.                        */
/* ------------------------------------------------------------------ */
export function Pic({ p, v, className, style, eager }) {
  const ed = useEdit();
  const im = toImg(v);
  const st = { objectFit: im.fit || undefined, objectPosition: im.pos || undefined, ...style };

  if (!ed.editing) {
    if (!im.src) return null;
    return <img src={im.src} alt={stripTags(im.alt)} className={className} style={st} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
  }

  const selected = ed.selection?.path === p;
  const props = {
    className: cx(className, 'se-pic', selected && 'se-selected'),
    style: st,
    title: 'Click to edit · drag to move/swap',
    draggable: true,
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      ed.select({ kind: 'image', path: p });
    },
    onDoubleClick: (e) => {
      e.stopPropagation();
      ed.replaceImage(p);
    },
    onDragStart: (e) => {
      e.dataTransfer.clearData(); // drop the browser's default URL/HTML so text fields don't swallow the image
      e.dataTransfer.setData(DT_PATH, p);
      e.dataTransfer.effectAllowed = 'copyMove';
    },
    onDragOver: (e) => {
      if (hasType(e, DT_PATH) || hasType(e, DT_MEDIA) || hasType(e, 'Files')) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('se-drop');
      }
    },
    onDragLeave: (e) => e.currentTarget.classList.remove('se-drop'),
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('se-drop');
      ed.dropOnImage(p, e.dataTransfer);
    },
  };
  if (!im.src) {
    return (
      <div {...props} className={cx(props.className, 'se-pic-empty')}>
        <span>＋ Click or drop an image</span>
      </div>
    );
  }
  return <img src={im.src} alt={stripTags(im.alt)} {...props} />;
}

/* ------------------------------------------------------------------ */
/* L — link / button with editable label and URL.                       */
/* ------------------------------------------------------------------ */
export function L({ p, v, className, children }) {
  const ed = useEdit();
  const link = v || {};
  if (!ed.editing) {
    if (!link.label && !children) return null;
    const external = /^https?:\/\//.test(link.href || '');
    return (
      <a href={link.href || '#'} className={className} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
        {link.label ? <span dangerouslySetInnerHTML={{ __html: link.label }} /> : null}
      </a>
    );
  }
  return (
    <a href={link.href || '#'} className={cx(className, 'se-link')} onClick={(e) => e.preventDefault()} draggable={false}>
      {children}
      <T p={`${p}.label`} v={link.label} placeholder="Button text" />
      <button
        type="button"
        className="se-linkbtn"
        contentEditable={false}
        title={`Link: ${link.href || '(none)'} — click to change`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          ed.editLink(`${p}.href`, link.href);
        }}
      >
        🔗
      </button>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Item / AddItem — repeatable list entries (cards, links, stats...).   */
/* ------------------------------------------------------------------ */
export function Item({ as: Tag = 'div', list, i, className, style, children, ...rest }) {
  const ed = useEdit();
  if (!ed.editing) return <Tag className={className} style={style} {...rest}>{children}</Tag>;
  return (
    <Tag className={cx(className, 'se-item')} style={style} {...rest}>
      {children}
      <span className="se-itembar" contentEditable={false} onMouseDown={(e) => e.preventDefault()}>
        <button type="button" title="Move back" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ed.moveItem(list, i, -1); }}>←</button>
        <button type="button" title="Move forward" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ed.moveItem(list, i, 1); }}>→</button>
        <button type="button" title="Duplicate" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ed.duplicateItem(list, i); }}>⧉</button>
        <button type="button" title="Delete" className="danger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); ed.removeItem(list, i); }}>✕</button>
      </span>
    </Tag>
  );
}

export function AddItem({ list, items, make, label = 'Add item', className }) {
  const ed = useEdit();
  if (!ed.editing) return null;
  return (
    <button
      type="button"
      className={cx('se-additem', className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ed.addItem(list, items, make);
      }}
    >
      ＋ {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Floats — free-positioned images inside a section. Drag to move,      */
/* drag the corner to resize.                                           */
/* ------------------------------------------------------------------ */
export function Floats({ p, items }) {
  const ed = useEdit();
  if (!items?.length) return null;
  return (
    <div className="floats" aria-hidden={ed.editing ? undefined : 'true'}>
      {items.map((f, i) => (
        <Float key={f.id || i} f={f} p={`${p}.${i}`} ed={ed} />
      ))}
    </div>
  );
}

function Float({ f, p, ed }) {
  const style = {
    left: `${f.x}%`,
    top: `${f.y}%`,
    width: `${f.w}%`,
    zIndex: f.z || 2,
    transform: f.r ? `rotate(${f.r}deg)` : undefined,
  };
  const cls = cx('float', f.round && 'round', f.shadow && 'shadow', f.hideMobile && 'hide-m');
  if (!ed.editing) return <img className={cls} style={style} src={f.src} alt={stripTags(f.alt)} loading="lazy" />;

  const startDrag = (e, mode) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    ed.select({ kind: 'float', path: p });
    const layer = e.currentTarget.closest('.floats').getBoundingClientRect();
    const s = { x: f.x, y: f.y, w: f.w, px: e.clientX, py: e.clientY };
    let first = true;
    const move = (ev) => {
      const dx = ((ev.clientX - s.px) / layer.width) * 100;
      const dy = ((ev.clientY - s.py) / layer.height) * 100;
      const next =
        mode === 'resize'
          ? { ...f, w: Math.max(4, Math.min(100, s.w + dx)) }
          : { ...f, x: +Math.max(-15, Math.min(100, s.x + dx)).toFixed(2), y: +Math.max(-15, Math.min(100, s.y + dy)).toFixed(2) };
      ed.update(p, next, { history: first ? 'push' : 'none' });
      first = false;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const selected = ed.selection?.path === p;
  return (
    <div className={cx(cls, 'se-float', selected && 'se-selected')} style={style} onPointerDown={(e) => startDrag(e, 'move')} onClick={(e) => e.stopPropagation()}>
      <img src={f.src} alt="" draggable={false} />
      <span className="se-resize" onPointerDown={(e) => startDrag(e, 'resize')} title="Drag to resize" />
    </div>
  );
}
