import dynamic from "next/dynamic";

const MarketSidebar = dynamic(() => import("@/app/components/sidebar/MarketSidebar"), { ssr: false });

export default function LearnSidebar() {
  return (
    <aside className="hidden lg:block w-[360px] min-h-screen p-3 space-y-4 border-l bg-white sticky top-0">
      <MarketSidebar />
    </aside>
  );
}
