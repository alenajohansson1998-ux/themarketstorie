import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
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
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
