import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { modal, closeAuth, setMode, signIn } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', pass: '' });
  const signup = modal.mode === 'signup';

  useEffect(() => {
    if (!modal.open) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal.open, closeAuth]);

  if (!modal.open) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    signIn(form);
    setForm((f) => ({ ...f, pass: '' }));
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closeAuth()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onSubmit={submit}>
        <button type="button" className="modal-close" onClick={closeAuth} aria-label="Close">✕</button>
        <div className="modal-brand"><i /><span>Cineverse</span></div>
        <div>
          <h2 className="modal-title" id="auth-title">{signup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="modal-sub">
            {signup ? 'Save films, rate what you watch, get better picks.' : 'Your wishlist and ratings follow you to any device.'}
          </p>
        </div>
        <div className="form">
          {signup && (
            <label className="field">
              <span>Name</span>
              <input value={form.name} onChange={set('name')} placeholder="Alex Reyes" autoComplete="name" />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.pass} onChange={set('pass')} placeholder="••••••••" autoComplete={signup ? 'new-password' : 'current-password'} />
          </label>
          {!signup && <a href="#" className="forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>}
        </div>
        <button type="submit" className="modal-cta">{signup ? 'Create account' : 'Sign in'}</button>
        <div className="modal-switch">
          <span>{signup ? 'Already have an account?' : 'New to Cineverse?'}</span>
          <button type="button" onClick={() => setMode(signup ? 'signin' : 'signup')}>
            {signup ? 'Sign in' : 'Create an account'}
          </button>
        </div>
      </form>
    </div>
  );
}
