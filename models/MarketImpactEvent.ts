import mongoose, { type Model } from 'mongoose';
import type { RadarEvent } from '@/lib/market-impact/types';

interface MarketImpactEventRecord {
  slug: string;
  sourceIds: string[];
  publishedAt: Date;
  analyzedAt: Date;
  methodologyVersion: string;
  data: RadarEvent;
}

/** Small derived snapshots, not full third-party articles. Reuses the site's existing connection. */
const schema = new mongoose.Schema<MarketImpactEventRecord>({
  slug: { type: String, required: true, unique: true, maxlength: 120 },
  sourceIds: { type: [String], required: true, index: true },
  publishedAt: { type: Date, required: true, index: true },
  analyzedAt: { type: Date, required: true },
  methodologyVersion: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const MarketImpactEvent: Model<MarketImpactEventRecord> = mongoose.models.MarketImpactEvent || mongoose.model<MarketImpactEventRecord>('MarketImpactEvent', schema);
export default MarketImpactEvent;
