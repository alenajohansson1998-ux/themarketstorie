import WorldMarketHeatMap from "./WorldMarketHeatMap";

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-4 py-3 sm:py-4 md:py-5">
      <div className="absolute inset-0 z-0 h-full w-full" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_55%,_#eef2f7_100%)]" />
      </div>

      <div className="site-shell relative z-10 grid w-full grid-cols-1 items-center justify-items-center gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-7">
        <div className="flex flex-col items-center px-1 py-1 text-center sm:px-2 sm:py-2 lg:px-4">
          <h1 className="mb-3 max-w-2xl text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
            Clarity & Insight for Modern Markets
          </h1>
          <p className="mb-6 max-w-xl text-base font-medium text-gray-700 sm:text-lg lg:text-xl">
            Real-time news, markets, and intelligence to help you make informed decisions.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <a
              href="/news"
              className="inline-block w-full rounded-lg border-2 border-black bg-black px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors duration-150 hover:bg-white hover:text-black sm:w-auto lg:px-8 lg:text-lg"
            >
              Explore News
            </a>
            <a
              href="/markets"
              className="inline-block w-full rounded-lg border-2 border-black bg-white px-6 py-3 text-base font-semibold text-black shadow-lg transition-colors duration-150 hover:bg-black hover:text-white sm:w-auto lg:px-8 lg:text-lg"
            >
              View Markets
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px] sm:max-w-[620px] lg:ml-auto lg:mr-0 lg:max-w-[700px]">
          <div>
            <WorldMarketHeatMap
              showSummaryChips={false}
              showFootnote
              footnoteText="Real-time global market data powered by direct feeds and regional proxy coverage."
              compact
            />
          </div>
        </div>
      </div>
    </section>
  );
}
