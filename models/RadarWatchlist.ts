import mongoose, { type Model } from 'mongoose';

export interface RadarWatchlistRecord { userId: string; eventSlugs: string[]; entityIds: string[] }

const schema = new mongoose.Schema<RadarWatchlistRecord>({
  userId: { type: String, required: true, unique: true, maxlength: 128 },
  eventSlugs: { type: [String], default: [], validate: { validator: (ids: string[]) => ids.length <= 100, message: 'Too many followed events.' } },
  entityIds: { type: [String], default: [], validate: { validator: (ids: string[]) => ids.length <= 100, message: 'Too many followed entities.' } },
}, { timestamps: true });

const RadarWatchlist: Model<RadarWatchlistRecord> = mongoose.models.RadarWatchlist || mongoose.model<RadarWatchlistRecord>('RadarWatchlist', schema);
export default RadarWatchlist;
