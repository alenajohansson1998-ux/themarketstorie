import { FAQ_ITEMS } from "@/lib/crypto-tokens";

export default function FAQSection() {
  return (
    <section aria-labelledby="crypto-faq" className="max-w-3xl">
      <h2 id="crypto-faq" className="mb-4 text-title2 text-ink">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-line-soft border-y border-line-soft">
        {FAQ_ITEMS.map((item, i) => (
          <details key={item.q} className="group" open={i === 0}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-headline text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="text-title3 font-normal text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="pb-4 text-body text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
