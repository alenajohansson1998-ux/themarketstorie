'use client';

import { useId, useState } from 'react';

export default function NewsletterForm({ source = 'subscription-page' }: { source?: string }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('error');
        setMessage(data.error || 'We couldn’t add you right now. Try again in a moment.');
      }
    } catch {
      setStatus('error');
      setMessage('We couldn’t reach the server. Check your connection and try again.');
    }
  }

  if (status === 'done') {
    return (
      <p role="status" className="rounded-card bg-up/10 px-4 py-3 text-body text-ink">
        You’re subscribed. The next issue will arrive at <span className="font-semibold">{email}</span>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor={id} className="block text-footnote font-medium text-ink">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={status === 'error' || undefined}
          aria-describedby={message ? `${id}-error` : undefined}
          className="h-12 flex-1 rounded-control border border-line bg-canvas px-4 text-body text-ink placeholder:text-ink-3 transition-colors focus:border-tint"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex h-12 items-center justify-center rounded-control bg-ink px-6 text-headline text-canvas transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {message ? (
        <p id={`${id}-error`} role="alert" className="text-footnote text-down">
          {message}
        </p>
      ) : null}
    </form>
  );
}
