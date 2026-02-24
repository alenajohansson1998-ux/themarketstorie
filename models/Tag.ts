import mongoose, { Document, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new mongoose.Schema<ITag>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  color: { type: String, default: '#3B82F6' },
}, {
  timestamps: true,
});

const Tag: Model<ITag> = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);

export default Tag;
