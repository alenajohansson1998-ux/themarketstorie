import Link from 'next/link';

export default function Footer({ className = "" }) {
  return (
    <footer className={`w-full bg-black text-gray-300 text-sm ${className}`}>
      
      {/* FULL WIDTH CONTENT */}
      <div className="site-shell px-8 py-12">

        {/* Brand */}
        <div className="mb-2">
          <h3 className="text-white text-lg font-semibold mb-3">
            TheMarketStories
          </h3>
          <p className="leading-relaxed max-w-none">
            TheMarketStories is an independent digital news and media platform
            delivering timely coverage of global and Indian financial markets,
            business news, economic developments, technology, and current
            affairs. Our content is published for informational and educational
            purposes and is intended to help readers stay informed about market
            trends and events.
          </p>
        </div>

        {/* Risk Disclosure */}
        <div className="border-t border-gray-700 pt-1 space-y-4 leading-relaxed text-gray-400">
          <p>
            <strong className="text-gray-300">Risk Disclosure:</strong> Financial
            markets, cryptocurrencies, derivatives, and other investment
            instruments are subject to market risk, including the potential
            loss of capital. Information published on TheMarketStories does not
            constitute financial, investment, or trading advice, nor should it
            be considered a recommendation or solicitation to buy or sell any
            securities or assets.
          </p>

          <p>
            Market data, prices, charts, and other information displayed on this
            website may be delayed, estimated, or sourced from third parties.
            While reasonable efforts are made to ensure accuracy, TheMarketStories
            does not guarantee the completeness or reliability of any data and
            shall not be responsible for any losses arising from reliance on
            such information.
          </p>

          <p>
            Readers are encouraged to conduct their own research and seek advice
            from qualified financial professionals before making any investment
            or trading decisions.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} TheMarketStories. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400">
            <Link href="/about" className="hover:text-white transition">About Us</Link>
            <Link href="/advertise" className="hover:text-white transition">Advertise</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/risk-disclosure" className="hover:text-white transition">Risk Disclosure</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
