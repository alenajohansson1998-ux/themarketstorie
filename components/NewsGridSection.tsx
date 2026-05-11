import React from 'react';

interface Article {
  title: string;
  summary?: string;
  image?: string;
  source?: string;
  time?: string;
  viewAllHref?: string;
  postHref?: string;
}

export default function NewsGridSection({ title, articles, viewAllHref }: { title: string; articles: Article[]; viewAllHref?: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label">News</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#17130f] sm:text-3xl">{title}</h2>
        </div>
        {viewAllHref && (
          <a href={viewAllHref} className="text-blue-600 hover:underline text-sm font-medium">View All</a>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <a key={idx} href={article.postHref} className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition-shadow">
            {article.image && (
              <img src={article.image} alt={article.title} className="rounded mb-3 h-36 w-full object-cover" />
            )}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
            {article.summary && <p className="text-gray-600 text-sm mb-2 line-clamp-3">{article.summary}</p>}
            <div className="text-xs text-gray-400 mt-auto flex justify-between items-center">
              {article.source && <span>{article.source}</span>}
              {article.time && <span>{article.time}</span>}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
