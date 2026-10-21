"use client";

import ReactCountryFlag from "react-country-flag";

const CURRENCY_COUNTRY: Record<string, string> = {
  EUR: "EU", USD: "US", GBP: "GB", JPY: "JP", CHF: "CH", AUD: "AU", NZD: "NZ", HKD: "HK", TWD: "TW",
  SGD: "SG", CNY: "CN", KRW: "KR", AED: "AE", ZAR: "ZA", CAD: "CA", INR: "IN",
};

/** Flag for a currency code. Decorative: the code is always printed next to it. */
export default function CurrencyFlag({ code }: { code: string }) {
  const country = CURRENCY_COUNTRY[code];
  if (!country) return null;
  return (
    <ReactCountryFlag
      countryCode={country}
      svg
      aria-hidden="true"
      style={{ width: "1.25em", height: "0.9em", borderRadius: 2, objectFit: "cover" }}
    />
  );
}
