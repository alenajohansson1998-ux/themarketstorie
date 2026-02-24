import dynamic from 'next/dynamic';
import HeatmapTableClient from "./HeatmapTableClient";

import Head from "next/head";

export default function ToolsPage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://themarketstories.com/tools" />
      </Head>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Tools</h1>
        <p className="mb-6">Welcome to the Tools page. Explore our live Forex Heatmap below.</p>
        <section className="mb-12">
          <HeatmapTableClient />
        </section>
      </main>
    </>
  );
}