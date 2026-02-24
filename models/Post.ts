import mongoose, { Document, Model } from 'mongoose';

export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slugOverride?: string;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  author: mongoose.Types.ObjectId;
  paymentStatus: 'pending' | 'failed' | 'paid';
  publicationStatus: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
  paymentIntentId?: string;
  // stripeSessionId removed
  paymentFailureReason?: string;
  seo: ISEO;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  trending?: boolean;
}

const PostSchema = new mongoose.Schema<IPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentStatus: { type: String, enum: ['pending', 'failed', 'paid'], default: 'pending' },
  publicationStatus: { type: String, enum: ['draft', 'pending_review', 'approved', 'rejected', 'published'], default: 'draft' },
  paymentIntentId: { type: String },
  // stripeSessionId removed
  paymentFailureReason: { type: String },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
    slugOverride: { type: String },
  },
  views: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, {
  timestamps: true,
});

// Index for better query performance
PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
