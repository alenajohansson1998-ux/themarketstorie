"use client";
import React from "react";
import Link from "next/link";
import { Handshake, LifeBuoy, Mail, Newspaper } from "lucide-react";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/siteConfig";

const fieldClass =
  "w-full rounded-control border border-line bg-canvas px-3.5 text-body text-ink placeholder:text-ink-3 transition-colors focus:border-tint";

const TOPICS = [
  { icon: Mail, title: "General questions", desc: "Our platform, coverage or your account." },
  { icon: Handshake, title: "Advertising and partnerships", desc: "Sponsored content, banners, newsletter and brand deals." },
  { icon: Newspaper, title: "Editorial", desc: "Guest posts, press releases and contributor applications." },
  { icon: LifeBuoy, title: "Technical support", desc: "Sign-in problems, errors or slow pages." },
];

const FAQS = [
  { q: "Do you accept sponsored articles?", a: "Yes. We offer sponsored content, native articles and brand packages, always labelled as sponsored. See the Advertise page or email us." },
  { q: "How long does publishing take?", a: "Usually 24–72 hours after editorial review and approval." },
  { q: "Do you accept guest posts?", a: "Yes, depending on quality and relevance. Send your pitch with topic ideas and writing samples." },
  { q: "What topics do you cover?", a: "Stocks, crypto, forex, commodities, business, fintech, technology, global economics and market analysis." },
  { q: "Can I submit a press release?", a: "Yes. Send it to our editorial team and we’ll review it for coverage." },
];

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSentTo(form.email);
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Your message wasn’t sent. Try again in a moment.");
      }
    } catch {
      setError("Your message wasn’t sent. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-container px-4 md:px-6">
      <section className="border-b border-line-soft py-14 lg:py-20">
        <p className="section-label">Contact</p>
        <h1 className="mt-3 max-w-3xl text-title1 text-ink sm:text-display">
          We’d love to <span className="font-serif italic font-normal text-ink-2">hear</span> from you.
        </h1>
        <p className="mt-4 max-w-2xl text-title3 font-normal text-ink-2">
          Readers, advertisers, contributors and press: we read every message and usually reply within one business day.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-14 border-b border-line-soft py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-title2 text-ink">Send a message</h2>

          {sentTo !== null ? (
            <div role="status" className="mt-6 rounded-media bg-surface p-8">
              <p className="text-title2 text-ink">Message sent</p>
              <p className="mt-2 text-body text-ink-2">
                Thanks for getting in touch. We’ll reply to <span className="font-medium text-ink">{sentTo}</span>.
              </p>
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="mt-4 inline-flex min-h-11 items-center text-subhead font-medium text-tint hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-footnote font-medium text-ink">
                  Full name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`${fieldClass} h-11`}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-footnote font-medium text-ink">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`${fieldClass} h-11`}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-footnote font-medium text-ink">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="How can we help?"
                  className={`${fieldClass} resize-y py-3`}
                />
              </div>
              {error ? (
                <p role="alert" className="rounded-control bg-down/10 px-3 py-2 text-footnote text-down">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center self-start rounded-control bg-ink px-6 text-headline text-canvas transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>

        <div className="lg:border-l lg:border-line-soft lg:pl-14">
          <h2 className="text-title2 text-ink">Other ways to reach us</h2>
          <dl className="mt-6 border-t border-line-soft text-subhead">
            <div className="flex justify-between gap-4 border-b border-line-soft py-3">
              <dt className="text-ink-2">Email</dt>
              <dd>
                <a href={`mailto:${CONTACT_EMAIL}`} className="break-all font-medium text-tint hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line-soft py-3">
              <dt className="text-ink-2">Publisher</dt>
              <dd className="font-medium text-ink">TheMarketStories Media</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line-soft py-3">
              <dt className="text-ink-2">Location</dt>
              <dd className="font-medium text-ink">India (remote)</dd>
            </div>
          </dl>

          <h3 className="mt-10 text-headline text-ink">What to write to us about</h3>
          <ul className="mt-3 space-y-4">
            {TOPICS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface text-ink" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-subhead font-semibold text-ink">{title}</p>
                  <p className="text-subhead text-ink-2">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-headline text-ink">Follow us</h3>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center gap-3 rounded-card bg-surface px-4 transition-colors hover:bg-fill"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                  <span>
                    <span className="block text-subhead font-semibold text-ink">{s.label}</span>
                    <span className="block text-footnote text-ink-2">{s.handle}</span>
                  </span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line-soft py-14" aria-labelledby="contact-faq">
        <h2 id="contact-faq" className="mb-4 text-title2 text-ink">
          Frequently asked questions
        </h2>
        <div className="max-w-3xl divide-y divide-line-soft border-y border-line-soft">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-headline text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-title3 font-normal text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="pb-4 text-body text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-8 py-14 sm:flex-row sm:items-end lg:py-20">
        <div>
          <h2 className="max-w-xl text-title1 text-ink">Want to reach our readers?</h2>
          <p className="mt-2 text-body text-ink-2">See advertising formats, standards and how to get started.</p>
        </div>
        <Link
          href="/advertise"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-control bg-ink px-7 text-headline text-canvas transition-opacity hover:opacity-85"
        >
          Advertise with us
        </Link>
      </section>
    </div>
  );
}
