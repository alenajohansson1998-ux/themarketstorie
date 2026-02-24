import mongoose, { Document, Model } from 'mongoose';

export interface INavItem extends Document {
  name: string;
  href: string;
  order: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NavItemSchema = new mongoose.Schema<INavItem>({
  name: { type: String, required: true },
  href: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const NavItem: Model<INavItem> = mongoose.models.NavItem || mongoose.model<INavItem>('NavItem', NavItemSchema);

export default NavItem;
