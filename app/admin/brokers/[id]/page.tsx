
import { notFound } from "next/navigation";
import { FaStar, FaPhone, FaMapMarkerAlt, FaGlobe, FaShieldAlt, FaCheckCircle, FaCoins, FaUserFriends, FaFileAlt } from "react-icons/fa";

async function getBroker(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/brokers?id=${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.broker || null;
}

export default async function AdminBrokerDetailPage({ params }: { params: { id: string } }) {
  const broker = await getBroker(params.id);
  if (!broker) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Banner */}
      {broker.bannerUrl && (
        <div className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden">
          <img
            src={broker.bannerUrl}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-10 -mt-32 relative z-10">
        {/* HEADER */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-2xl shadow-2xl p-8 mb-8 flex flex-col md:flex-row items-start md:items-center gap-8">
          <img
            src={broker.logoUrl}
            alt={broker.name}
            className="w-28 h-28 rounded-full border-4 border-white/40 bg-white/10 object-contain shadow-xl grayscale"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg tracking-tight text-white/90">{broker.name}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              {broker.badge && (
                <span className="bg-white/10 border border-white/30 text-white px-4 py-1 rounded-full text-sm font-semibold shadow flex items-center gap-2">
                  <FaShieldAlt className="inline mr-1 text-white/70" /> {broker.badge}
                </span>
              )}
              <span className="flex items-center gap-1 text-white/80 font-bold text-lg">
                <FaStar className="text-white/60" /> {broker.rating}
              </span>
              <span className="text-white/60 text-sm">{broker.ratingText}</span>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <FaCoins className="text-white/60" />
              <div>
                <div className="text-xs text-white/50">Tradable Assets</div>
                <div className="font-semibold text-white text-lg">{broker.assets}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-white/60" />
              <div>
                <div className="text-xs text-white/50">Reviews</div>
                <div className="font-semibold text-white text-lg">{broker.reviews}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaUserFriends className="text-white/60" />
              <div>
                <div className="text-xs text-white/50">Accounts</div>
                <div className="font-semibold text-white text-lg">{broker.accounts}</div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-xl shadow-2xl p-6">
            <div className="text-xs text-white/50 mb-1">Description</div>
            <p className="text-white/90 leading-relaxed">
              {broker.description}
            </p>
          </div>
        </div>

        {/* TERMS */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Terms & Fees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-300">Forex, CFDs, Spread bets</div>
                <div className="font-semibold text-white">20.00 €</div>
              </div>
              <div>
                <div className="text-xs text-gray-300">Inactivity Fee</div>
                <div className="font-semibold text-white">No</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-300 mb-1">Additional Details</div>
              <p className="text-white/80 leading-relaxed">
                0% commission, no conversion on withdrawals fees. Spread from just
                0.1 point on GBP/USD, 0.9 points on the UK 100, and 2 points on
                NatGas and US Wall Street 30.
              </p>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">About {broker.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-white/60" />
                <span className="text-xs text-white/50">Regulator</span>
                <div className="font-semibold text-white ml-2">{broker.regulator || 'N/A'}</div>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-white/60" />
                <span className="text-xs text-white/50">Website</span>
                <a
                  href={broker.website}
                  className="text-white/80 underline ml-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {broker.website}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-white/60" />
                <span className="text-xs text-white/50">Phone</span>
                <div className="font-semibold text-white ml-2">{broker.phone || 'N/A'}</div>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-white/60" />
                <span className="text-xs text-white/50">Address</span>
                <div className="font-semibold text-white ml-2">{broker.address || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-300 mb-1">Overview</div>
              <p className="text-white/80 leading-relaxed">
                Trusted by traders globally, {broker.name} offers fast,
                reliable, and professional trading services.
              </p>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Tools & Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white/90">
            {[
              "Order types",
              "Limit orders",
              "Stop orders",
              "Brackets",
              "Partial position close",
              "Demo account",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-md shadow"
              >
                <FaCheckCircle className="text-white/60" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/30 rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">FAQs</h2>
          <div className="space-y-3">
            {[
              `What can I trade with ${broker.name}?`,
              `Does ${broker.name} have an inactivity fee?`,
              `Is ${broker.name} regulated?`,
            ].map((q) => (
              <details
                key={q}
                className="group border border-white/20 rounded-lg p-4 cursor-pointer bg-white/5 backdrop-blur"
              >
                <summary className="font-semibold text-white/90">
                  {q}
                </summary>
                <p className="mt-2 text-white/70">
                  Please refer to the broker details above.
                </p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
