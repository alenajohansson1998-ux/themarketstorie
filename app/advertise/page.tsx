"use client";
import { useState } from "react";

const formats = [
  { num: "01", title: "Sponsored Articles", desc: "Long-form editorial content published under your brand with full organic reach across our site and newsletter." },
  { num: "02", title: "Display Banner Ads", desc: "High-visibility placements across all key pages — header, sidebar, and in-article — on desktop and mobile." },
  { num: "03", title: "Homepage Placements", desc: "Premium above-the-fold visibility on our highest-traffic page, seen by every reader who visits." },
  { num: "04", title: "Newsletter Promotions", desc: "Direct placement inside our weekly financial newsletter — delivered to 40,000+ engaged subscribers." },
  { num: "05", title: "Social Media Promotions", desc: "Branded content and shoutouts across our active social channels to extend your reach beyond the site." },
];

export default function AdvertisePage() {
  const [form, setForm] = useState({ name: "", company: "", email: "", format: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/advertising-enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitted(true);
  }

  return (
    <div className="site-container bg-white text-gray-900">

      {/* Opening */}
      <section className="border-b border-gray-200 py-20 px-4 sm:px-8 lg:px-20">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-6">Advertise With Us</p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] max-w-5xl">
          Put your brand in front of{" "}
          <span className="italic font-serif text-gray-400">500,000+</span>{" "}
          finance-focused readers.
        </h1>
      </section>


      {/* Why advertise */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-10">Why Advertise With Us</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <p className="text-xl text-gray-700 leading-relaxed mb-5">
              TheMarketStories reaches investors, traders, and financial professionals across 120+ countries
              every month. Our readers are not passive — they are actively seeking information to make
              financial decisions with real money.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              Whether you&apos;re a fintech brand, a trading platform, an education company, or a consumer
              product targeting high-income audiences — we can put your message exactly where it matters.
            </p>
          </div>
          <div className="flex flex-col gap-6 border-l border-gray-200 pl-10">
            {[
              { stat: "85%",   note: "of our readers have active investment portfolios" },
              { stat: "3.2×",  note: "higher engagement than general news platforms" },
              { stat: "Top 3", note: "financial news source across 40+ countries" },
            ].map((s) => (
              <div key={s.stat}>
                <p className="text-3xl font-black text-gray-900">{s.stat}</p>
                <p className="text-sm text-gray-500 mt-1">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form (left) + Formats (right) */}
      <section className="border-b border-gray-200 px-4 sm:px-8 lg:px-20 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT — Form */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Get in Touch</p>
            <h2 className="text-3xl font-black leading-tight mb-4">
              Let&apos;s talk about your campaign.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">
              Fill in the form and we&apos;ll get back to you within 1–2 business days with availability,
              pricing, and format recommendations.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Or email us directly at{" "}
              <a href="mailto:Alvensmith1998@gmail.com" className="text-gray-900 underline underline-offset-2 hover:text-blue-600 transition-colors">
                Alvensmith1998@gmail.com
              </a>
            </p>

            {submitted ? (
              <div className="border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-4xl font-black mb-3">Sent.</p>
                <p className="text-gray-500">
                  We&apos;ll be in touch at{" "}
                  <span className="text-gray-900 font-medium">{form.email}</span> within 1–2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Full Name *</label>
                  <input
                    name="name" required value={form.name} onChange={handleChange}
                    placeholder="John Smith"
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors placeholder:text-gray-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Company / Brand</label>
                  <input
                    name="company" value={form.company} onChange={handleChange}
                    placeholder="Your Company"
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors placeholder:text-gray-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Email Address *</label>
                  <input
                    name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="you@company.com"
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors placeholder:text-gray-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Advertising Format</label>
                  <select
                    name="format" value={form.format} onChange={handleChange}
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors text-gray-700"
                  >
                    <option value="">Select a format</option>
                    <option>Sponsored Articles</option>
                    <option>Display Banner Ads</option>
                    <option>Homepage Placements</option>
                    <option>Newsletter Promotions</option>
                    <option>Social Media Promotions</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Message *</label>
                  <textarea
                    name="message" required rows={5} value={form.message} onChange={handleChange}
                    placeholder="Tell us about your campaign goals, target audience, and budget..."
                    className="border-b border-gray-300 focus:border-gray-900 outline-none py-2.5 text-sm bg-transparent transition-colors resize-none placeholder:text-gray-300"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-700 text-white font-semibold px-10 py-3.5 rounded-lg transition-colors text-sm"
                  >
                    Submit Enquiry
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT — Advertising Formats */}
          <div className="border-l border-gray-200 pl-16">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-10">Advertising Formats</p>
            <div className="divide-y divide-gray-200">
              {formats.map((f) => (
                <div key={f.num} className="py-6 grid grid-cols-[40px_1fr] gap-5 items-start">
                  <p className="text-xl font-black text-gray-200">{f.num}</p>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">{f.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Guidelines */}
      <section className="border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200 p-10 lg:p-16">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Our Standards</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              We take our editorial reputation seriously. Every advertisement that runs on TheMarketStories
              is reviewed before it goes live — no exceptions.
            </p>
          </div>
          <div className="p-10 lg:p-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              {[
                { rule: "Accurate & Non-Misleading", note: "All claims in ads must be factual and verifiable." },
                { rule: "Legally Compliant",         note: "Ads must comply with applicable laws in all target markets." },
                { rule: "Clearly Labelled",          note: "Sponsored content is always marked — we never blur the line." },
                { rule: "Editorially Appropriate",   note: "Content must align with our audience and editorial values." },
              ].map((g) => (
                <div key={g.rule}>
                  <p className="text-sm font-bold text-gray-900 mb-1">{g.rule}</p>
                  <p className="text-sm text-gray-500">{g.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs text-gray-400 pt-6 border-t border-gray-100">
              We do not accept illegal, misleading, adult, hate speech, or harmful content of any kind.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-8 lg:px-20 py-20 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Ready?</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight max-w-lg">
            Reach the audience that moves the markets.
          </h2>
        </div>
        <div className="shrink-0">
          <a
            href="mailto:Alvensmith1998@gmail.com"
            className="inline-block bg-gray-900 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
          >
            Email Us Now
          </a>
        </div>
      </section>

    </div>
  );
}
