"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/crypto-tokens";

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section>
      <p className="section-label mb-4">Frequently Asked Questions</p>
      <div className="divide-y divide-[#1e2535] border border-[#1e2535] rounded-2xl overflow-hidden">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#0d1117] transition-colors"
            >
              <span className="text-white text-sm font-semibold pr-4">{item.q}</span>
              <ChevronDown
                size={16}
                className={`text-gray-500 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5">
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
