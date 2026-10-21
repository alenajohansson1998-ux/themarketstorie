import Link from "next/link";
import WorldMarketHeatMap from "./WorldMarketHeatMap";
import { buttonVariants } from "./ui/button";

export default function HeroBanner() {
  return (
    <section className="border-b border-line-soft">
      <div className="site-container grid grid-cols-1 items-center gap-8 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:py-14">
        <div className="text-center lg:text-left">
          <p className="section-label">Independent financial news</p>
          <h1 className="mx-auto mt-3 max-w-xl text-title1 text-ink sm:text-display lg:mx-0">
            Clarity &amp; insight for modern markets
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-body text-ink-2 sm:text-title3 sm:font-normal lg:mx-0">
            Real-time news, market data and analysis for investors, traders and analysts.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/blog" className={buttonVariants({ variant: "filled", size: "lg" })}>
              Read the latest news
            </Link>
            <Link href="/markets" className={buttonVariants({ variant: "gray", size: "lg" })}>
              View markets
            </Link>
          </div>
        </div>

        {/* Hidden on phones so stories come first and low-power devices skip the WebGL globe. */}
        <div className="mx-auto hidden w-full max-w-[440px] sm:block">
          <WorldMarketHeatMap showSummaryChips={false} showFootnote={false} compact />
        </div>
      </div>
    </section>
  );
}
