'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { username, password } = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const { token } = await api('/api/auth/login', { method: 'POST', body: { username, password } });
      setToken(token);
      router.replace('/admin');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand"><b>Sharma</b> Engineering</div>
        <h1>Website editor</h1>
        <p>Sign in to edit your website.</p>
        <label>Username<input name="username" autoComplete="username" required autoFocus /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <div className="login-error">{error}</div>}
        <button className="a-btn a-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a href="/" className="login-back">← Back to website</a>
      </form>
    </div>
  );
}
