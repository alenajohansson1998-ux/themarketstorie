
'use client';
import React from "react";

const BlogCarousel = ({ posts }: { posts: any[] }) => {
  // Placeholder illustrations (SVGs)
  const illustrations = [
    <svg key="mountains" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-28"><rect width="120" height="60" rx="12" fill="#E0F7FA"/><path d="M0 60L30 30L50 50L80 10L120 60H0Z" fill="#B2EBF2"/><circle cx="100" cy="20" r="8" fill="#FFF9C4"/></svg>,
    <svg key="balloon" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-28"><rect width="120" height="60" rx="12" fill="#E8F5E9"/><ellipse cx="60" cy="30" rx="18" ry="22" fill="#FFECB3"/><rect x="54" y="48" width="12" height="8" rx="2" fill="#FFB300"/><rect x="58" y="56" width="4" height="4" rx="1" fill="#FFB300"/></svg>,
    <svg key="camping" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-28"><rect width="120" height="60" rx="12" fill="#F1F8E9"/><polygon points="60,15 80,55 40,55" fill="#A5D6A7"/><rect x="55" y="40" width="10" height="15" rx="2" fill="#388E3C"/><circle cx="90" cy="50" r="6" fill="#FFF9C4"/></svg>
  ];

  // Carousel state
  const [current, setCurrent] = React.useState(1); // center card
  const total = Math.min(posts.length, 3);

  // Carousel navigation
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  // Only show up to 3 posts
  const visiblePosts = posts.slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center py-16 px-2 bg-white relative">
      <div className="relative flex items-center justify-center w-full max-w-4xl">
        {/* Left Arrow */}
        <button
          aria-label="Previous"
          onClick={prev}
          className="absolute left-0 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 top-1/2 -translate-y-1/2 transition border border-gray-200"
        >
          <svg width="24" height="24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {/* Cards */}
        <div className="flex gap-8 w-full justify-center">
          {visiblePosts.map((post, i) => (
            <div
              key={post._id || i}
              className={`relative bg-white rounded-3xl shadow-xl flex flex-col items-center px-6 pt-6 pb-8 w-72 transition-all duration-300 ${
                i === current ? "scale-105 z-10 shadow-2xl border-2 border-green-400" : "opacity-80 scale-95 z-0"
              }`}
              style={{ marginTop: i === current ? 0 : 16, marginBottom: i === current ? 0 : 16 }}
            >
              <div className="w-full flex justify-center mb-4">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title || "Blog post image"}
                    className="w-full h-28 object-cover rounded-2xl"
                  />
                ) : (
                  illustrations[i]
                )}
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
                <a
                  href={post.url || "#"}
                  className="mt-2 px-5 py-2 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-900 transition text-sm text-center max-w-[220px] truncate"
                  title={post.title}
                >
                  {post.title?.length > 50 ? post.title.slice(0, 50) + "…" : post.title}
                </a>
                  {/* Social Share Buttons */}
                  <div className="flex gap-3 mt-4">
                    {/* Twitter */}
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.url || typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on Twitter"
                      className="hover:bg-blue-100 rounded-full p-2 transition"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37c-.83.5-1.75.87-2.72 1.07A4.28 4.28 0 0 0 12 9.75c0 .34.04.67.1.99C8.09 10.6 4.83 8.8 2.67 6.15c-.37.64-.58 1.38-.58 2.17 0 1.5.77 2.83 1.94 3.61-.72-.02-1.4-.22-1.99-.55v.06c0 2.1 1.49 3.85 3.47 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.34 0-.67-.02-1-.06A12.13 12.13 0 0 0 7.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.2 8.2 0 0 1-2.36.65z"/></svg>
                    </a>
                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.url || typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on Facebook"
                      className="hover:bg-blue-100 rounded-full p-2 transition"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.696h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
                    </a>
                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(post.url || typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on LinkedIn"
                      className="hover:bg-blue-100 rounded-full p-2 transition"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.25 11.25h-3v-5.5c0-1.32-.03-3-1.83-3-1.83 0-2.11 1.43-2.11 2.91v5.59h-3v-10h2.88v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.61z"/></svg>
                    </a>
                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + (post.url || typeof window !== 'undefined' ? window.location.href : ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on WhatsApp"
                      className="hover:bg-green-100 rounded-full p-2 transition"
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.075.149.198 2.096 3.2 5.076 4.348.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347z"/></svg>
                    </a>
                  </div>
              </div>
            </div>
          ))}
        </div>
        {/* Right Arrow */}
        <button
          aria-label="Next"
          onClick={next}
          className="absolute right-0 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 top-1/2 -translate-y-1/2 transition border border-gray-200"
        >
          <svg width="24" height="24" fill="none"><path d="M9 5l7 7-7 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Pagination Dots */}
      <div className="flex gap-2 mt-8">
        {visiblePosts.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${i === current ? "bg-black-600" : "bg-black-200"}`}
          />
        ))}
      </div>
      {/* Black Bottom Section */}
   </div>
  );
};

export default BlogCarousel;
