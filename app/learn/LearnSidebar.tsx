import dynamic from "next/dynamic";

const MarketSidebar = dynamic(() => import("@/app/components/sidebar/MarketSidebar"), { ssr: false });

export default function LearnSidebar() {
  return (
    <aside className="sticky top-0 hidden w-full max-w-[320px] shrink-0 bg-white xl:block">
      <MarketSidebar />
    </aside>
  );
}
