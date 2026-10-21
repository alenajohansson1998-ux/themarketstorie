"use client";
import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/siteConfig";

const FORMATS = [
  { title: "Sponsored articles", desc: "Long-form content published under your brand, with organic reach across the site and newsletter." },
  { title: "Display banners", desc: "Header, sidebar and in-article placements on desktop and mobile." },
  { title: "Homepage placements", desc: "Above-the-fold visibility on our highest-traffic page." },
  { title: "Newsletter promotions", desc: "A placement inside our weekly financial newsletter." },
  { title: "Social promotions", desc: "Branded posts across our social channels to extend your reach." },
];

const STANDARDS = [
  { rule: "Accurate and not misleading", note: "Every claim in an ad must be factual and verifiable." },
  { rule: "Legally compliant", note: "Ads must comply with the laws of every market they target." },
  { rule: "Clearly labelled", note: "Sponsored content is always marked as sponsored." },
  { rule: "Editorially appropriate", note: "Content must suit our audience and editorial values." },
];

// Audience figures. Keep these in step with your analytics before publishing.
const AUDIENCE = [
  { stat: "500K+", note: "monthly readers across 120+ countries" },
  { stat: "85%", note: "of readers hold active investment portfolios" },
  { stat: "40K+", note: "newsletter subscribers" },
];

const fieldClass =
  "w-full rounded-control border border-line bg-canvas px-3.5 text-body text-ink placeholder:text-ink-3 transition-colors focus:border-tint";

export default function AdvertisePage() {
  const [form, setForm] = useState({ name: "", company: "", email: "", format: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/advertising-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="site-container px-4 md:px-6">
      <section className="border-b border-line-soft py-14 lg:py-20">
        <p className="section-label">Advertise</p>
        <h1 className="mt-3 max-w-4xl text-title1 text-ink sm:text-display">
          Put your brand in front of finance-focused readers.
        </h1>
        <p className="mt-4 max-w-2xl text-title3 font-normal text-ink-2">
          Investors, traders and financial professionals come to TheMarketStories to make decisions with real money.
          We put fintech, trading and education brands where those decisions happen.
        </p>
        <dl className="mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {AUDIENCE.map((item) => (
            <div key={item.stat} className="flex flex-col-reverse border-t border-line pt-3">
              <dt className="mt-1 text-subhead text-ink-2">{item.note}</dt>
              <dd className="text-title1 tabular-nums text-ink">{item.stat}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid grid-cols-1 items-start gap-14 border-b border-line-soft py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-title2 text-ink">Tell us about your campaign</h2>
          <p className="mt-2 text-body text-ink-2">
            We reply within 1–2 business days with availability, pricing and format recommendations. Or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-tint hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          {status === "sent" ? (
            <div role="status" className="mt-6 rounded-media bg-surface p-8">
              <p className="text-title2 text-ink">Enquiry sent</p>
              <p className="mt-2 text-body text-ink-2">
                We’ll be in touch at <span className="font-medium text-ink">{form.email}</span> within 1–2 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="ad-name" className="block text-footnote font-medium text-ink">Full name</label>
                  <input id="ad-name" name="name" required autoComplete="name" value={form.name} onChange={handleChange} className={`${fieldClass} h-11`} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ad-company" className="block text-footnote font-medium text-ink">
                    Company <span className="font-normal text-ink-2">(optional)</span>
                  </label>
                  <input id="ad-company" name="company" autoComplete="organization" value={form.company} onChange={handleChange} className={`${fieldClass} h-11`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ad-email" className="block text-footnote font-medium text-ink">Work email</label>
                <input id="ad-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange} className={`${fieldClass} h-11`} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ad-format" className="block text-footnote font-medium text-ink">
                  Format <span className="font-normal text-ink-2">(optional)</span>
                </label>
                <select id="ad-format" name="format" value={form.format} onChange={handleChange} className={`${fieldClass} h-11`}>
                  <option value="">Not sure yet</option>
                  {FORMATS.map((f) => (
                    <option key={f.title}>{f.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ad-message" className="block text-footnote font-medium text-ink">Campaign details</label>
                <textarea
                  id="ad-message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Goals, target audience, timing and budget"
                  className={`${fieldClass} resize-y py-3`}
                />
              </div>
              {status === "error" ? (
                <p role="alert" className="rounded-control bg-down/10 px-3 py-2 text-footnote text-down">
                  Your enquiry wasn’t sent. Try again, or email us directly.
                </p>
              ) : null}
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex h-11 items-center justify-center self-start rounded-control bg-ink px-6 text-headline text-canvas transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          )}
        </div>

        <div className="lg:border-l lg:border-line-soft lg:pl-14">
          <h2 className="text-title2 text-ink">Formats</h2>
          <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
            {FORMATS.map((f) => (
              <li key={f.title} className="py-4">
                <h3 className="text-headline text-ink">{f.title}</h3>
                <p className="mt-1 text-subhead text-ink-2">{f.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14" aria-labelledby="ad-standards">
        <h2 id="ad-standards" className="text-title2 text-ink">
          Our standards
        </h2>
        <p className="mt-2 max-w-2xl text-body text-ink-2">
          Every advertisement is reviewed before it goes live. We don’t accept illegal, misleading, adult, hateful or
          harmful content.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((g) => (
            <div key={g.rule} className="border-t border-line pt-3">
              <h3 className="text-headline text-ink">{g.rule}</h3>
              <p className="mt-1 text-subhead text-ink-2">{g.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
