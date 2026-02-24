import mongoose, { Schema, Document } from 'mongoose';

export interface IBroker extends Document {
  name: string;
  logoUrl: string;
  rating: number;
  ratingText: string;
  assets: string;
  reviews: number;
  accounts: string;
  badge?: string;
  description?: string;
  regulator?: string;
  website?: string;
  phone?: string;
  address?: string;
  terms?: string;
  features?: string[];
  faq?: { question: string; answer: string }[];
  banner?: string; // Banner image URL
}

const BrokerSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: { type: String, required: true },
  rating: { type: Number, required: true },
  ratingText: { type: String, required: true },
  assets: { type: String, required: true },
  reviews: { type: Number, required: true },
  accounts: { type: String, required: true },
  badge: { type: String },
  description: { type: String },
  regulator: { type: String },
  website: { type: String },
  phone: { type: String },
  address: { type: String },
  terms: { type: String },
  features: [{ type: String }],
  faq: [{ question: String, answer: String }],
  banner: { type: String }, // Banner image URL
});

export default mongoose.models.Broker || mongoose.model<IBroker>('Broker', BrokerSchema);
