import React from "react";

interface TopHeadlineSectionProps {
  imageUrl: string;
  headline: string;
  summary: string;
  source?: string;
  link?: string;
}

const TopHeadlineSection: React.FC<TopHeadlineSectionProps> = ({
  imageUrl,
  headline,
  summary,
  source,
  link,
}) => {
  return (
    <section className="w-full bg-white rounded-lg shadow mb-8 overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-2/5 w-full h-64 md:h-auto relative">
        <img
          src={imageUrl}
          alt="Top headline"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-6 flex flex-col justify-center md:w-3/5">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
          {headline}
        </h1>
        <p className="text-gray-700 mb-4">{summary}</p>
        {source && (
          <span className="text-xs text-gray-500 mb-2">Source: {source}</span>
        )}
        {link && (
          <a
            href={link}
            className="inline-block mt-2 text-blue-600 hover:underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more
          </a>
        )}
      </div>
    </section>
  );
};

export default TopHeadlineSection;
