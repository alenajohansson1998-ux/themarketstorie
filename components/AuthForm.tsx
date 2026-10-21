'use client';

import { useId, useState } from 'react';
import { signIn } from 'next-auth/react';

export type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  /** Called after a successful sign-in or registration. */
  onSuccess: (mode: AuthMode) => void;
  headingId?: string;
  /** h1 on the full sign-in page, h2 inside the dialog */
  headingLevel?: 'h1' | 'h2';
}

const inputClass =
  'h-11 w-full rounded-control border border-line bg-canvas px-3.5 text-body text-ink placeholder:text-ink-3 transition-colors focus:border-tint';

export default function AuthForm({ mode, onModeChange, onSuccess, headingId, headingLevel = 'h2' }: AuthFormProps) {
  const Heading = headingLevel;
  const fieldId = useId();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  function update(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function switchMode(next: AuthMode) {
    setError('');
    onModeChange(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const email = formData.email.trim().toLowerCase();

    try {
      if (isLogin) {
        const result = await signIn('credentials', { email, password: formData.password, redirect: false });
        if (result?.error) {
          setError('That email and password don’t match an account. Check them and try again.');
          return;
        }
        onSuccess('login');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('The two passwords don’t match.');
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email, password: formData.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'We couldn’t create your account. Try again in a moment.');
        return;
      }
      await signIn('credentials', { email, password: formData.password, redirect: false });
      onSuccess('register');
    } catch {
      setError('We couldn’t reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Heading id={headingId} className="text-title2 text-ink">
          {isLogin ? 'Sign in' : 'Create your account'}
        </Heading>
        <p className="text-subhead text-ink-2">
          {isLogin ? 'Like, comment and manage your account.' : 'Free, and takes less than a minute.'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => signIn('google')}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-control border border-line bg-canvas text-headline text-ink transition-colors hover:bg-surface"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-footnote text-ink-2" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
        {!isLogin ? (
          <div className="space-y-1.5">
            <label htmlFor={`${fieldId}-name`} className="block text-footnote font-medium text-ink">
              Full name
            </label>
            <input
              id={`${fieldId}-name`}
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={update}
              className={inputClass}
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor={`${fieldId}-email`} className="block text-footnote font-medium text-ink">
            Email
          </label>
          <input
            id={`${fieldId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={formData.email}
            onChange={update}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${fieldId}-password`} className="block text-footnote font-medium text-ink">
            Password
          </label>
          <input
            id={`${fieldId}-password`}
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            value={formData.password}
            onChange={update}
            className={inputClass}
          />
        </div>

        {!isLogin ? (
          <div className="space-y-1.5">
            <label htmlFor={`${fieldId}-confirm`} className="block text-footnote font-medium text-ink">
              Confirm password
            </label>
            <input
              id={`${fieldId}-confirm`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={update}
              className={inputClass}
            />
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-control bg-down/10 px-3 py-2 text-footnote text-down">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center rounded-control bg-ink text-headline text-canvas transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-subhead text-ink-2">
        {isLogin ? 'New to TheMarketStories?' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => switchMode(isLogin ? 'register' : 'login')}
          className="inline-flex min-h-11 items-center font-medium text-tint hover:underline"
        >
          {isLogin ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
