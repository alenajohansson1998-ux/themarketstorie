import type { FinnhubNewsItem } from "@/lib/finnhub";

interface MarketNewsProps {
  news: FinnhubNewsItem[];
}

function formatDate(epochSeconds: number): string {
  if (!epochSeconds) return "Unknown date";
  return new Date(epochSeconds * 1000).toLocaleString();
}

export default function MarketNews({ news }: MarketNewsProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-semibold text-gray-900">Related News</h2>

      {news.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No recent news available for this market.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {news.map((item) => (
            <li
              key={`${item.id}-${item.datetime}`}
              className="rounded-lg border border-gray-100 p-4 transition hover:border-gray-200"
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                <h3 className="text-base font-semibold text-gray-900">{item.headline}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{item.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>{formatDate(item.datetime)}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
