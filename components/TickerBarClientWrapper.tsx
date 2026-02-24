"use client";
import React from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const MarketTickerBarLoader = dynamic(() => import("./MarketTickerBarLoader"), { ssr: false });

export default function TickerBarClientWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <MarketTickerBarLoader />;
}