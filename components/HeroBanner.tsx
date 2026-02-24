import WorldMarketHeatMap from "./WorldMarketHeatMap";

export default function HeroBanner() {
  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden px-4 py-20 md:py-24">
      <div className="absolute inset-0 z-0 h-full w-full" aria-hidden="true">
        <img
          src="/herobaner.png"
          alt="Market background"
          className="h-full w-full object-cover object-center"
          draggable="false"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/65 to-black/90" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center px-2 py-6 text-center lg:items-start lg:px-6 lg:text-left">
          <h1 className="mb-5 max-w-2xl text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl">
            Clarity & Insight for Modern Markets
          </h1>
          <p className="mb-10 max-w-xl text-lg font-medium text-slate-200 md:text-xl">
            Real-time news, markets, and intelligence to help you make informed decisions.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row lg:justify-start">
            <a
              href="/news"
              className="inline-block rounded-lg border-2 border-black bg-black px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors duration-150 hover:bg-white hover:text-black"
            >
              Explore News
            </a>
            <a
              href="/markets"
              className="inline-block rounded-lg border-2 border-black bg-white px-8 py-3 text-lg font-semibold text-black shadow-lg transition-colors duration-150 hover:bg-black hover:text-white"
            >
              View Markets
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[740px] lg:ml-auto lg:mr-2">
          <div>
            <WorldMarketHeatMap />
          </div>
        </div>
      </div>
    </section>
  );
}
