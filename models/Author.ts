import mongoose, { Document, Model } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role: "staff" | "guest" | "ai";
  website?: string;
  linkedin?: string;
  x?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new mongoose.Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["staff", "guest", "ai"],
      default: "staff",
    },
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    x: { type: String, default: "" },
  },
  { timestamps: true }
);

AuthorSchema.index({ slug: 1 }, { unique: true });
AuthorSchema.index({ name: 1 });

const Author: Model<IAuthor> =
  mongoose.models.Author || mongoose.model<IAuthor>("Author", AuthorSchema);

export default Author;
