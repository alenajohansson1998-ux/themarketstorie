import mongoose, { Document, Model } from 'mongoose';

export interface IMarketList extends Document {
  slug: string;
  title: string;
  description: string;
  filters: any; // JSON object for filters
  static_items: string[]; // array of instrument _ids
  computed: {
    type: 'dynamic' | 'static';
    refresh_seconds: number;
  };
  visibility: 'public' | 'private';
  meta: any; // additional metadata
  last_updated: Date;
}

const MarketListSchema = new mongoose.Schema<IMarketList>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  filters: { type: mongoose.Schema.Types.Mixed },
  static_items: [{ type: String }],
  computed: {
    type: { type: String, enum: ['dynamic', 'static'], required: true },
    refresh_seconds: { type: Number, required: true },
  },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  meta: { type: mongoose.Schema.Types.Mixed },
  last_updated: { type: Date, default: Date.now },
});

const MarketList: Model<IMarketList> = mongoose.models.MarketList || mongoose.model<IMarketList>('MarketList', MarketListSchema);

export default MarketList;
