// Helper to fetch broker data
async function getBroker(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/brokers?slug=${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.broker || null;
}

import { notFound } from "next/navigation";
import {
  FaShieldAlt,
  FaGlobe,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaCheck,
  FaCoins,
  FaFileAlt,
  FaUserFriends
} from "react-icons/fa";
import BlogCarousel from "@/components/BlogCarousel";
import BrokerBlogCarouselSection from "@/components/BrokerBlogCarouselSection";

// ================= HELPERS =================
function BlackCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black text-white rounded-2xl p-6 shadow-xl border border-white/10">
      {children}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center">
      {icon && <span className="mr-2 shrink-0">{icon}</span>}
      <div>
        <div className="text-white/50 text-sm">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}


export default async function BrokerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const broker = await getBroker(id);
  if (!broker) return notFound();

  // Banner image: use broker.banner if available, else fallback
  const bannerUrl = broker.banner || "/logos/default-broker-banner.jpg";

  // Fetch broker category blog posts
  let blogPosts: any[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cms/posts?category=broker&limit=3`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      blogPosts = data.data || [];
    }
  } catch (e) {
    // ignore error, show empty
  }

  return (
    <>
      {/* Canonical tag for SEO */}
      <head>
        <link rel="canonical" href={`https://themarketstories.com/brokers/${id}`} />
      </head>
      <div className="bg-white min-h-screen text-gray-900">

      {/* ================= BANNER ================= */}
      <div
        className="relative min-h-[380px] w-full flex items-end"
        style={{
          backgroundImage: `url(${bannerUrl}), linear-gradient(to bottom right, #000, #18181b 80%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end gap-8">
          <img
            src={broker.logoUrl}
            alt={broker.name}
            className="w-28 h-28 rounded-full bg-white p-2 shadow-xl"
          />

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              {broker.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="text-yellow-400 font-bold">
                {broker.rating} ★
              </span>
              <span>{broker.ratingText}</span>
              {broker.badge && (
                <span className="border border-white/30 px-3 py-1 rounded-full text-xs">
                  {broker.badge}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {broker.website ? (
              <a
                href={broker.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black font-semibold px-6 py-2 rounded-xl hover:bg-gray-200 transition inline-flex items-center justify-center"
              >
                Open Account
              </a>
            ) : (
              <button className="bg-white text-black font-semibold px-6 py-2 rounded-xl opacity-60 cursor-not-allowed" disabled>
                Open Account
              </button>
            )}
            <button className="border border-white/30 text-white px-6 py-2 rounded-xl hover:bg-white/10 transition">
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-10">

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlackCard>
            <Stat label="Tradable Assets" value={broker.assets} icon={<FaCoins className="text-yellow-400 text-xl mr-2" />} />
            <Stat label="Reviews" value={broker.reviews} icon={<FaFileAlt className="text-blue-400 text-xl mr-2" />} />
            <Stat label="Accounts" value={broker.accounts} icon={<FaUserFriends className="text-green-400 text-xl mr-2" />} />
          </BlackCard>

          <BlackCard>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-white/70 leading-relaxed">
              {broker.description}
            </p>
          </BlackCard>
        </div>

        {/* TERMS */}
        <BlackCard>
          <h2 className="text-xl font-bold mb-4">Terms & Fees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/70">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-green-400" />
                <span className="font-semibold">Forex, CFDs:</span>
                <span>20.00 €</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-blue-400" />
                <span className="font-semibold">Inactivity Fee:</span>
                <span>No</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-yellow-400" />
              <span>0% commission, low spreads on major instruments.</span>
            </div>
          </div>
        </BlackCard>

        {/* ABOUT */}
        <BlackCard>
          <h2 className="text-xl font-bold mb-4">About {broker.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/70">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-blue-400" />
                <span className="font-semibold">Regulator:</span>
                <span>{broker.regulator || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-green-400" />
                <span className="font-semibold">Website:</span>
                {broker.website ? (
                  <a href={broker.website} className="underline ml-1" target="_blank" rel="noopener noreferrer">
                    {broker.website}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-yellow-400" />
                <span className="font-semibold">Phone:</span>
                <span>{broker.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-400" />
                <span className="font-semibold">Address:</span>
                <span>{broker.address || "-"}</span>
              </div>
            </div>
            <p>
              Trusted globally for fast execution, strong regulation, and
              professional-grade trading tools.
            </p>
          </div>
        </BlackCard>

        {/* FEATURES */}
        <BlackCard>
          <h2 className="text-xl font-bold mb-4">Tools & Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Order Types",
              "Limit Orders",
              "Stop Orders",
              "Brackets",
              "Partial Position Close",
              "Demo Account",
            ].map((f) => (
              <div
                key={f}
                className="border border-white/10 rounded-lg p-3 flex items-center gap-2 text-white/80 justify-center"
              >
                <FaCheck className="text-green-400" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </BlackCard>

        {/* FAQ */}
        <BlackCard>
          <h2 className="text-xl font-bold mb-4">FAQs</h2>
          <div className="space-y-3">
            {[
              `What can I trade with ${broker.name}?`,
              `Does ${broker.name} have inactivity fees?`,
              `Is ${broker.name} regulated?`,
            ].map((q) => (
              <details
                key={q}
                className="border border-white/10 rounded-lg p-4"
              >
                <summary className="cursor-pointer font-semibold">
                  {q}
                </summary>
                <p className="mt-2 text-white/70">
                  Please refer to the details above.
                </p>
              </details>
            ))}
          </div>
        </BlackCard>

        {/* REVIEWS */}
        <BlackCard>
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              {
                user: "user123",
                stars: "★★★★★",
                text: "Great broker, fast execution and solid platform.",
                date: "Jan 2026",
              },
              {
                user: "trader456",
                stars: "★★★★★",
                text: "Excellent spreads and no inactivity fee.",
                date: "Dec 2025",
              },
              {
                user: "invest789",
                stars: "★★★★☆",
                text: "Good overall experience, support is responsive.",
                date: "Nov 2025",
              },
            ].map((r, i) => (
              <div
                key={i}
                className="min-w-[320px] bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col"
              >
                <div className="text-yellow-400 font-bold mb-1">
                  {r.stars}
                </div>
                <div className="text-white/70 text-sm mb-3">
                  {r.text}
                </div>
                <div className="text-xs text-white/40 mt-auto">
                  by {r.user} • {r.date}
                </div>
              </div>
            ))}
          </div>
        </BlackCard>
            
      {/* BLOG CAROUSEL */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Latest from Our Blog</h2>
        <BlogCarousel posts={blogPosts} />
      </div>
      <BrokerBlogCarouselSection />
      </div>


      </div>
    </>
  );
}
