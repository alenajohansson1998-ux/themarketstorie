import Link from "next/link";
import DeferredGlobe from "./DeferredGlobe";
import { buttonVariants } from "./ui/button";

export default function HeroBanner() {
  return (
    <section className="border-b border-line-soft" aria-labelledby="home-title">
      <div className="site-container grid grid-cols-1 items-center gap-8 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:py-14">
        <div className="text-center lg:text-left">
          <p className="section-label">Financial news and market analysis</p>
          <h1 id="home-title" className="mx-auto mt-3 max-w-xl text-title1 text-ink sm:text-display lg:mx-0">
            Financial news, market analysis and business insights
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-body text-ink-2 sm:text-title3 sm:font-normal lg:mx-0">
            Reporting and analysis on global and Indian markets, business, the economy, technology and crypto, for
            investors, traders and analysts.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/blog" className={buttonVariants({ variant: "filled", size: "lg" })}>
              Read the latest news
            </Link>
            <Link href="/markets" prefetch={false} className={buttonVariants({ variant: "gray", size: "lg" })}>
              View markets
            </Link>
          </div>
        </div>

        <DeferredGlobe />
      </div>
    </section>
  );
}
