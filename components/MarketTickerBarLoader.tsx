import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MarketTickerItem } from '../components/MarketTickerBar';

const MarketTickerBar = dynamic(() => import('../components/MarketTickerBar'), { ssr: false });

const MarketTickerBarLoader: React.FC = () => {
  const [data, setData] = useState<MarketTickerItem[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch('/api/markets/ticker')
      .then((res) => res.json())
      .then((d) => { if (mounted) setData(d); });
    return () => { mounted = false; };
  }, []);
  if (!data.length) return null;
  return <MarketTickerBar data={data} />;
};

export default MarketTickerBarLoader;
