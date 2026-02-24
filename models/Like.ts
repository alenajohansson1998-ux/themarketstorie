import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  postId: string;
  userId: string;
  createdAt: Date;
}

const LikeSchema: Schema = new Schema({
  postId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can like a post only once
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);
