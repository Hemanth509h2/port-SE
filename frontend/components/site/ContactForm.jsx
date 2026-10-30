'use client';
import { useState } from 'react';
import { T } from '../edit/primitives';
import { useEdit } from '../edit/EditContext';
import { stripTags } from '@/lib/path';

export default function ContactForm({ s, p }) {
  const ed = useEdit();
  const [state, setState] = useState({ status: 'idle', error: '' });
  const services = stripTags(s.services || '').split(',').map((x) => x.trim()).filter(Boolean);

  async function submit(e) {
    e.preventDefault();
    if (ed.editing) return;
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    setState({ status: 'sending', error: '' });
    try {
      const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send, please try again');
      form.reset();
      setState({ status: 'sent', error: '' });
    } catch (err) {
      setState({ status: 'idle', error: err.message });
    }
  }

  if (state.status === 'sent') {
    return (
      <div className="form-card sent">
        <div className="tick">✓</div>
        <p dangerouslySetInnerHTML={{ __html: s.successText || 'Thank you!' }} />
        <button className="btn btn-dark" onClick={() => setState({ status: 'idle', error: '' })}>Send another</button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <T as="h3" className="h3" p={`${p}.formTitle`} v={s.formTitle} />
      <div className="row2">
        <label>Name *<input name="name" required maxLength={120} autoComplete="name" /></label>
        <label>Phone<input name="phone" maxLength={40} autoComplete="tel" inputMode="tel" /></label>
      </div>
      <label>Email<input name="email" type="email" maxLength={200} autoComplete="email" /></label>
      <label>
        Service
        <select name="service" defaultValue="">
          <option value="">Select a service…</option>
          {services.map((x) => <option key={x}>{x}</option>)}
        </select>
      </label>
      {ed.editing && (
        <div className="se-note">
          Service options (comma separated): <T as="span" p={`${p}.services`} v={s.services} />
        </div>
      )}
      <label>Project details<textarea name="message" rows={4} maxLength={4000} placeholder="Site location, approximate size, what you'd like to build…" /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      {state.error && <p className="form-error">{state.error}</p>}
      <button className="btn btn-primary" disabled={state.status === 'sending'} type="submit">
        {ed.editing ? <T p={`${p}.submitLabel`} v={s.submitLabel} /> : <span dangerouslySetInnerHTML={{ __html: state.status === 'sending' ? 'Sending…' : s.submitLabel || 'Send' }} />}
      </button>
      {ed.editing && (
        <div className="se-note">
          Message after sending: <T as="span" p={`${p}.successText`} v={s.successText} />
        </div>
      )}
    </form>
  );
}
