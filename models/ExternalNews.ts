import mongoose, { Document, Model } from 'mongoose';

export interface IExternalNews extends Document {
  // ID from the news API (e.g., "1", "external-123").
  // Not unique so we can keep multiple snapshots over time.
  externalId: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: Date;
  urlToImage?: string;
  source: string;
  category: string;
  tags: string[];
  url?: string; // Original article URL
  fetchedAt: Date; // When we fetched this article
  views: number;
  isActive: boolean; // Whether to show this article
  createdAt: Date;
  updatedAt: Date;
}

const ExternalNewsSchema = new mongoose.Schema<IExternalNews>({
  externalId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  urlToImage: { type: String },
  source: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  url: { type: String },
  fetchedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Indexes for better query performance
ExternalNewsSchema.index({ externalId: 1, publishedAt: -1 });
ExternalNewsSchema.index({ category: 1 });
ExternalNewsSchema.index({ source: 1 });
ExternalNewsSchema.index({ publishedAt: -1 });
ExternalNewsSchema.index({ isActive: 1 });
ExternalNewsSchema.index({ createdAt: -1 });

const ExternalNews: Model<IExternalNews> = mongoose.models.ExternalNews || mongoose.model<IExternalNews>('ExternalNews', ExternalNewsSchema);

export default ExternalNews;
