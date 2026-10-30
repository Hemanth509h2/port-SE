'use client';
import { useState } from 'react';
import Section from './Section';
import ContactForm from './ContactForm';
import { T, Pic, L, Item, AddItem } from '../edit/primitives';
import { useEdit } from '../edit/EditContext';
import { cx, img as toImg, stripTags } from '@/lib/path';

/* Shared heading block: label + title + intro text */
function Head({ s, p, center, children }) {
  return (
    <div className={cx('head', center && 'center')}>
      <T as="p" className="label" p={`${p}.label`} v={s.label} placeholder="Label" />
      <T as="h2" className="h2" p={`${p}.title`} v={s.title} placeholder="Heading" />
      <T as="p" className="lede" p={`${p}.text`} v={s.text} placeholder="Intro text" />
      {children}
    </div>
  );
}

function Hero({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest} dark>
      <div className="hero-bg">
        <Pic p={`${p}.image`} v={s.image} className="cover" eager />
        <div className="hero-shade" />
      </div>
      <div className="wrap hero-inner">
        <div className="hero-eyebrow">
          <T p={`${p}.eyebrowLeft`} v={s.eyebrowLeft} />
          <T p={`${p}.eyebrowRight`} v={s.eyebrowRight} />
        </div>
        <T as="p" className="hero-kicker" p={`${p}.kicker`} v={s.kicker} placeholder="Kicker" />
        <T as="h1" className="hero-title" p={`${p}.title`} v={s.title} placeholder="Big headline" />
        <T as="p" className="hero-text" p={`${p}.text`} v={s.text} />
        <div className="btns">
          <L p={`${p}.cta`} v={s.cta} className="btn btn-primary" />
          <L p={`${p}.secondary`} v={s.secondary} className="btn btn-ghost" />
        </div>
        <div className="hero-stats">
          {(s.stats || []).map((it, i) => (
            <Item key={it.id || i} list={`${p}.stats`} i={i} className="hero-stat">
              <T as="span" className="k" p={`${p}.stats.${i}.k`} v={it.k} />
              <T as="span" className="v" p={`${p}.stats.${i}.v`} v={it.v} />
            </Item>
          ))}
          <AddItem list={`${p}.stats`} items={s.stats} label="Add" />
        </div>
      </div>
    </Section>
  );
}

function Intro({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap intro">
        <div className="rv">
          <T as="p" className="label" p={`${p}.label`} v={s.label} />
          <T as="p" className="intro-lead" p={`${p}.lead`} v={s.lead} />
          <T as="div" className="intro-text" p={`${p}.text`} v={s.text} />
        </div>
        <figure className="intro-fig rv">
          <Pic p={`${p}.image`} v={s.image} className="cover" />
          <T as="figcaption" p={`${p}.caption`} v={s.caption} placeholder="Caption" />
        </figure>
      </div>
    </Section>
  );
}

function Features({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap">
        <Head s={s} p={p} />
        <div className="grid4">
          {(s.items || []).map((it, i) => (
            <Item key={it.id || i} as="article" list={`${p}.items`} i={i} className="feature rv">
              <T as="span" className="num" p={`${p}.items.${i}.num`} v={it.num} />
              <T as="h3" className="h3" p={`${p}.items.${i}.title`} v={it.title} />
              <T as="p" p={`${p}.items.${i}.text`} v={it.text} />
            </Item>
          ))}
        </div>
        <AddItem list={`${p}.items`} items={s.items} label="Add card" />
      </div>
    </Section>
  );
}

function Services({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap">
        <Head s={s} p={p} />
        <div className="grid3">
          {(s.items || []).map((it, i) => (
            <Item key={it.id || i} as="article" list={`${p}.items`} i={i} className="svc rv">
              <div className="svc-img">
                <Pic p={`${p}.items.${i}.image`} v={it.image} className="cover" />
              </div>
              <div className="svc-body">
                <T as="p" className="tag" p={`${p}.items.${i}.tag`} v={it.tag} />
                <T as="h3" className="h3" p={`${p}.items.${i}.title`} v={it.title} />
                <T as="p" p={`${p}.items.${i}.text`} v={it.text} />
                <T as="p" className="chips" p={`${p}.items.${i}.tags`} v={it.tags} placeholder="Tags" />
              </div>
            </Item>
          ))}
        </div>
        <AddItem list={`${p}.items`} items={s.items} label="Add service" />
      </div>
    </Section>
  );
}

function Applications({ s, p, ...rest }) {
  const [active, setActive] = useState(0);
  const items = s.items || [];
  const cur = Math.min(active, Math.max(0, items.length - 1));
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap">
        <Head s={s} p={p} />
        <div className="apps">
          <ol className="apps-list">
            {items.map((it, i) => (
              <Item
                key={it.id || i}
                as="li"
                list={`${p}.items`}
                i={i}
                className={cx('app', i === cur && 'on')}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="app-n">{String(i + 1).padStart(2, '0')}</span>
                <T as="span" className="app-t" p={`${p}.items.${i}.title`} v={it.title} />
                <span className="app-arrow">→</span>
              </Item>
            ))}
          </ol>
          <div className="apps-img">
            {items[cur] && <Pic p={`${p}.items.${cur}.image`} v={items[cur].image} className="cover" />}
          </div>
        </div>
        <AddItem list={`${p}.items`} items={s.items} label="Add application" />
      </div>
    </Section>
  );
}

function Stats({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest} dark>
      <div className="wrap">
        <Head s={s} p={p} />
        <div className="grid4 stats">
          {(s.items || []).map((it, i) => (
            <Item key={it.id || i} list={`${p}.items`} i={i} className="stat rv">
              <T as="div" className="stat-v" p={`${p}.items.${i}.value`} v={it.value} />
              <T as="p" p={`${p}.items.${i}.text`} v={it.text} />
            </Item>
          ))}
        </div>
        <AddItem list={`${p}.items`} items={s.items} label="Add number" />
      </div>
    </Section>
  );
}

function Projects({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap">
        <Head s={s} p={p} />
        <div className="projects">
          {(s.items || []).map((it, i) => (
            <Item key={it.id || i} as="article" list={`${p}.items`} i={i} className={cx('proj rv', i % 2 && 'flip')}>
              <figure className="proj-img">
                <Pic p={`${p}.items.${i}.image`} v={it.image} className="cover" />
                <T as="span" className="proj-fig" p={`${p}.items.${i}.fig`} v={it.fig} />
              </figure>
              <div className="proj-body">
                <div className="proj-top">
                  <T as="span" className="pill" p={`${p}.items.${i}.status`} v={it.status} />
                  <T as="span" className="tag" p={`${p}.items.${i}.category`} v={it.category} />
                </div>
                <T as="h3" className="proj-title" p={`${p}.items.${i}.title`} v={it.title} />
                <T as="p" p={`${p}.items.${i}.text`} v={it.text} />
                <dl className="meta">
                  {(it.meta || []).map((m, j) => (
                    <Item key={m.id || j} list={`${p}.items.${i}.meta`} i={j}>
                      <T as="dt" p={`${p}.items.${i}.meta.${j}.k`} v={m.k} />
                      <T as="dd" p={`${p}.items.${i}.meta.${j}.v`} v={m.v} />
                    </Item>
                  ))}
                </dl>
                <AddItem list={`${p}.items.${i}.meta`} items={it.meta} label="Add detail" />
              </div>
            </Item>
          ))}
        </div>
        <AddItem list={`${p}.items`} items={s.items} label="Add project" />
        <div className="center-row">
          <L p={`${p}.cta`} v={s.cta} className="btn btn-dark" />
        </div>
      </div>
    </Section>
  );
}

function Process({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap">
        <Head s={s} p={p} />
        <ol className="grid4 steps">
          {(s.items || []).map((it, i) => (
            <Item key={it.id || i} as="li" list={`${p}.items`} i={i} className="step rv">
              <T as="span" className="num" p={`${p}.items.${i}.num`} v={it.num} />
              <T as="h3" className="h3" p={`${p}.items.${i}.title`} v={it.title} />
              <T as="p" p={`${p}.items.${i}.text`} v={it.text} />
            </Item>
          ))}
        </ol>
        <AddItem list={`${p}.items`} items={s.items} label="Add step" />
      </div>
    </Section>
  );
}

function Gallery({ s, p, ...rest }) {
  const ed = useEdit();
  const [open, setOpen] = useState(-1);
  const items = s.items || [];
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap">
        <Head s={s} p={p} />
        <div className="masonry">
          {items.map((it, i) => (
            <Item key={it.id || i} as="figure" list={`${p}.items`} i={i} className="gal rv" onClick={() => !ed.editing && setOpen(i)}>
              <Pic p={`${p}.items.${i}.image`} v={it.image} />
              <T as="figcaption" p={`${p}.items.${i}.caption`} v={it.caption} placeholder="Caption" />
            </Item>
          ))}
        </div>
        <AddItem list={`${p}.items`} items={s.items} label="Add photo" make={() => ({ image: { src: '' }, caption: '' })} />
        <div className="center-row">
          <L p={`${p}.cta`} v={s.cta} className="btn btn-dark" />
        </div>
      </div>
      {open >= 0 && items[open] && (
        <div className="lightbox" onClick={() => setOpen(-1)} role="dialog" aria-modal="true">
          <button className="lb-btn lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + items.length) % items.length); }}>‹</button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={toImg(items[open].image).src} alt={stripTags(toImg(items[open].image).alt)} />
            <figcaption dangerouslySetInnerHTML={{ __html: items[open].caption || '' }} />
          </figure>
          <button className="lb-btn lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % items.length); }}>›</button>
          <button className="lb-btn lb-close" aria-label="Close" onClick={() => setOpen(-1)}>✕</button>
        </div>
      )}
    </Section>
  );
}

function Cta({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest} dark>
      <div className="wrap cta">
        <T as="h2" className="cta-title" p={`${p}.title`} v={s.title} />
        <T as="p" className="lede" p={`${p}.text`} v={s.text} />
        <div className="btns">
          <L p={`${p}.cta`} v={s.cta} className="btn btn-primary" />
          <L p={`${p}.secondary`} v={s.secondary} className="btn btn-ghost" />
        </div>
      </div>
    </Section>
  );
}

function Contact({ s, p, global, ...rest }) {
  const c = global.contact || {};
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap contact">
        <div>
          <Head s={s} p={p} />
          <ul className="contact-list">
            <li><span>Phone</span><T as="b" p="global.contact.phone" v={c.phone} /></li>
            <li><span>Email</span><T as="b" p="global.contact.email" v={c.email} /></li>
            <li><span>Address</span><T as="b" p="global.contact.address" v={c.address} /></li>
            <li><span>Hours</span><T as="b" p="global.contact.hours" v={c.hours} /></li>
          </ul>
        </div>
        <ContactForm s={s} p={p} />
      </div>
    </Section>
  );
}

function PageHeader({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap ph">
        <div>
          <T as="p" className="label" p={`${p}.label`} v={s.label} />
          <T as="h1" className="ph-title" p={`${p}.title`} v={s.title} />
          <T as="p" className="lede" p={`${p}.text`} v={s.text} />
        </div>
        <div className="ph-img">
          <Pic p={`${p}.image`} v={s.image} className="cover" eager />
        </div>
      </div>
    </Section>
  );
}

function TextImage({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className={cx('wrap ti', s.variant === 'flip' && 'flip')}>
        <div className="rv">
          <T as="p" className="label" p={`${p}.label`} v={s.label} />
          <T as="h2" className="h2" p={`${p}.title`} v={s.title} />
          <T as="div" className="rich" p={`${p}.text`} v={s.text} />
          <div className="btns">
            <L p={`${p}.cta`} v={s.cta} className="btn btn-dark" />
          </div>
        </div>
        <div className="ti-img rv">
          <Pic p={`${p}.image`} v={s.image} className="cover" />
        </div>
      </div>
    </Section>
  );
}

function RichText({ s, p, ...rest }) {
  return (
    <Section s={s} p={p} {...rest}>
      <div className="wrap narrow">
        <T as="p" className="label" p={`${p}.label`} v={s.label} />
        <T as="h2" className="h2" p={`${p}.title`} v={s.title} />
        <T as="div" className="rich" p={`${p}.text`} v={s.text} />
      </div>
    </Section>
  );
}

export const SECTIONS = {
  hero: Hero,
  intro: Intro,
  features: Features,
  services: Services,
  applications: Applications,
  stats: Stats,
  projects: Projects,
  process: Process,
  gallery: Gallery,
  cta: Cta,
  contact: Contact,
  pageHeader: PageHeader,
  textImage: TextImage,
  richText: RichText,
};
