import mongoose, { Document, Model } from "mongoose";
import {
  ARTICLE_STATUSES,
  ARTICLE_TYPES,
  ArticleStatus,
  ArticleType,
} from "@/lib/articles/constants";

export interface IArticleSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: mongoose.Types.ObjectId;
  tags: string[];
  type: ArticleType;
  image?: string;
  author: mongoose.Types.ObjectId;
  seo: IArticleSEO;
  status: ArticleStatus;
  aiGenerated: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new mongoose.Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String, trim: true }],
    type: {
      type: String,
      enum: ARTICLE_TYPES,
      required: true,
    },
    image: { type: String, default: "" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: [{ type: String }],
    },
    status: {
      type: String,
      enum: ARTICLE_STATUSES,
      default: "draft",
      index: true,
    },
    aiGenerated: { type: Boolean, default: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ type: 1, status: 1, publishedAt: -1 });
ArticleSchema.index({ createdAt: -1 });

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
