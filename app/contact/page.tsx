"use client";
import React from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
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
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message.");
      }
    } catch {
      setError("Failed to send message.");
    }
    setLoading(false);
  }

  const quickCards = [
    { icon: "📧", title: "Email Support",             desc: "General questions about our platform, coverage, or account.", email: "Alvensmith1998@gmail.com" },
    { icon: "🤝", title: "Advertising & Partnerships", desc: "Sponsored content, banner ads, newsletter & brand deals.",     email: "Alvensmith1998@gmail.com" },
    { icon: "📰", title: "Editorial Inquiries",        desc: "Guest posts, press releases, and contributor applications.",   email: "Alvensmith1998@gmail.com" },
    { icon: "⚡", title: "Technical Support",          desc: "Account access, platform errors, or performance issues.",      email: "Alvensmith1998@gmail.com" },
  ];

  const socials = [
    { label: "Facebook",   handle: "@The Market Stories",   href: "https://www.facebook.com/profile.php?id=61586298068930", color: "bg-blue-600",
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0"/></svg> },
    { label: "X (Twitter)", handle: "@MarketStorie",        href: "https://x.com/MarketStorie",                             color: "bg-gray-900",
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.53 3.5h3.97l-8.62 9.86 10.18 13.14h-8.02l-6.29-8.13-7.2 8.13H.03l9.22-10.56L0 3.5h8.19l5.77 7.47zm-1.14 17.13h2.2L6.62 5.13h-2.2z"/></svg> },
    { label: "Instagram",  handle: "@the_market_stories",   href: "https://www.instagram.com/the_market_stories/",          color: "bg-pink-600",
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.282.292 2.394 1.272 3.374.98.98 2.092 1.213 3.374 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.059 2.394-.292 3.374-1.272.98-.98 1.213-2.092 1.272-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.282-.292-2.394-1.272-3.374-.98-.98-2.092-1.213-3.374-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg> },
    { label: "YouTube",    handle: "The Market Stories",    href: "https://www.youtube.com/@The_Market_Stories",            color: "bg-red-600",
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.633 3.5 12 3.5 12 3.5s-7.633 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.94 0 12 0 12s0 4.06.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.367 20.5 12 20.5 12 20.5s7.633 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.06 24 12 24 12s0-4.06-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  ];

  const faqs = [
    { q: "Do you accept sponsored articles?",  a: "Yes. We offer sponsored content, native articles, and brand collaboration packages. Visit our Advertise page or email us directly." },
    { q: "How long does publishing take?",      a: "Typically within 24–72 hours after editorial review and approval." },
    { q: "Do you offer guest posting?",         a: "Yes, depending on content quality and niche relevance. Send your pitch with topic ideas and writing samples." },
    { q: "What topics do you cover?",           a: "Stocks, crypto, forex, commodities, business, fintech, technology, global economics, and market analysis." },
    { q: "Can I submit a press release?",       a: "Yes. Send your press release to our editorial team and we'll review it for coverage on TheMarketStories." },
  ];

  return (
    <div className="site-container bg-white text-gray-900">

      {/* Hero */}
      <section className="border-b border-gray-200 py-20 px-4 sm:px-8 lg:px-20">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-6">Contact</p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] max-w-4xl mb-6">
          We&apos;d love to{" "}
          <span className="italic font-serif text-gray-400">hear</span>{" "}
          from you.
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Whether you&apos;re a reader, advertiser, contributor, or press — we review every message and get back to you fast.
        </p>
      </section>

      {/* Form + Social */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT — Form */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Send a Message</p>
            <h2 className="text-3xl font-black leading-tight mb-4">Drop us a message.</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              We typically respond within 24 hours during business days.
            </p>

            {submitted ? (
              <div className="border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-4xl font-black mb-3">Sent.</p>
                <p className="text-gray-500 text-sm">
                  Thank you for reaching out. We&apos;ll be in touch at{" "}
                  <span className="text-gray-900 font-medium">{form.email || "your email"}</span> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Full Name *</label>
                  <input type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Smith"
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors placeholder:text-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Email Address *</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors placeholder:text-gray-300"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Message *</label>
                  <textarea required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us how we can help..."
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors resize-none placeholder:text-gray-300"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold px-10 py-3.5 rounded-lg transition-colors text-sm"
                  >
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT — Social + Business info */}
          <div className="border-l border-gray-200 pl-16">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Follow Us</p>
            <div className="grid grid-cols-2 gap-3 mb-12">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`${s.color} text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity`}
                >
                  {s.icon}
                  <div>
                    <p className="text-sm font-bold leading-tight">{s.label}</p>
                    <p className="text-xs opacity-75">{s.handle}</p>
                  </div>
                </a>
              ))}
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-5">Business Information</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">Platform</span>
                <span className="font-medium text-gray-900">TheMarketStories Media</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">Location</span>
                <span className="font-medium text-gray-900">India (Remote)</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">Email Support</span>
                <span className="font-medium text-gray-900">Available 24/7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Business Email</span>
                <a href="mailto:Alvensmith1998@gmail.com" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  Alvensmith1998@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Advertise With Us */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">For Brands</p>
            <h2 className="text-3xl font-black leading-tight mb-4">Why Brands Work With Us</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Reach a highly engaged, finance-focused global audience that trusts TheMarketStories for daily market updates.
            </p>
            <Link href="/advertise"
              className="inline-block bg-gray-900 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
            >
              View Advertise Page →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { stat: "Finance-Focused Audience",    note: "85% of readers actively track markets and investments." },
              { stat: "Global Reach",                note: "500K+ monthly readers across 120+ countries worldwide." },
              { stat: "SEO-Friendly Content",        note: "Sponsored articles rank on Google and drive long-term traffic." },
              { stat: "Crypto & Fintech Friendly",   note: "One of few platforms openly accepting crypto & Web3 brands." },
              { stat: "Fast Publishing",             note: "Campaigns reviewed and live within 24–72 hours." },
              { stat: "Daily Market Updates",        note: "Your brand sits alongside trusted, daily financial news." },
            ].map((item) => (
              <div key={item.stat} className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors">
                <p className="text-sm font-bold text-gray-900 mb-1">{item.stat}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-10">Frequently Asked Questions</p>
        <div className="divide-y divide-gray-200 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <p className="text-base font-bold text-gray-900 mb-2">{f.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCards.map((c) => (
            <a key={c.title} href={`mailto:${c.email}`}
              className="group border border-gray-200 rounded-xl p-6 hover:border-gray-900 hover:shadow-sm transition-all"
            >
              <p className="text-3xl mb-4">{c.icon}</p>
              <p className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{c.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Stats / Trust bar */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200">
          {[
            { value: "24 hrs",  label: "Average Response Time" },
            { value: "500K+",   label: "Monthly Readers Globally" },
            { value: "✓",       label: "Business Inquiries Welcome" },
            { value: "✓",       label: "Guest Posts & PR Accepted" },
          ].map((s) => (
            <div key={s.label} className="px-8 py-10">
              <p className="text-3xl font-black text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Explore More</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "About Us",        href: "/about" },
            { label: "Advertise",       href: "/advertise" },
            { label: "Latest News",     href: "/" },
            { label: "Market Data",     href: "/markets" },
            { label: "Brokers",         href: "/brokers" },
            { label: "Blog",            href: "/blog" },
            { label: "Privacy Policy",  href: "/privacy-policy" },
            { label: "Terms of Use",    href: "/terms" },
          ].map((l) => (
            <Link key={l.label} href={l.href}
              className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-full hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-8 lg:px-20 py-20 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Ready to Collaborate?</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight max-w-xl">
            Contact our editorial and advertising team today.
          </h2>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-3">
          <a href="mailto:Alvensmith1998@gmail.com"
            className="inline-block bg-gray-900 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Get in Touch
          </a>
          <Link href="/advertise"
            className="inline-block border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Advertise With Us
          </Link>
        </div>
      </section>

    </div>
  );
}
