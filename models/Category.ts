import mongoose, { Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  parent?: mongoose.Types.ObjectId;
  showInHeader?: boolean;
  isMainHeader?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  showInHeader: { type: Boolean, default: false },
  isMainHeader: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
