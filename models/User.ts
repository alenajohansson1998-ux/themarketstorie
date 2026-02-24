import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'editor' | 'user';
  image?: string;
  postCredits?: number; // Number of posts the user can create (for subscription)
  bio?: string;
  facebook?: string;
  linkedin?: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
  image: { type: String },
  postCredits: { type: Number, default: 0 }, // Default to 0 credits
  bio: { type: String, default: '' },
  facebook: { type: String, default: '' },
  linkedin: { type: String, default: '' },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
