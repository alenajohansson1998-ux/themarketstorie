import type { FinnhubNewsItem } from "@/lib/finnhub";

interface MarketNewsProps {
  news: FinnhubNewsItem[];
}

function formatDate(epochSeconds: number): string {
  if (!epochSeconds) return "";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(epochSeconds * 1000)
  );
}

export default function MarketNews({ news }: MarketNewsProps) {
  return (
    <section aria-labelledby="market-news-heading">
      <h2 id="market-news-heading" className="text-title3 text-ink">
        Related news
      </h2>

      {news.length === 0 ? (
        <p className="mt-3 text-subhead text-ink-2">No recent news for this market.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line-soft">
          {news.map((item) => (
            <li key={`${item.id}-${item.datetime}`} className="py-4">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
                <h3 className="text-headline text-ink group-hover:underline">{item.headline}</h3>
                {item.summary ? <p className="mt-1 line-clamp-3 text-subhead text-ink-2">{item.summary}</p> : null}
                <p className="mt-2 text-footnote text-ink-2">
                  {item.source}
                  {item.datetime ? ` · ${formatDate(item.datetime)}` : null}
                  <span className="sr-only"> (opens in a new tab)</span>
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
