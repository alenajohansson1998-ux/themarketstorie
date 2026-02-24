import mongoose, { Document, Model } from "mongoose";
import {
  PUBLICATION_LOG_ACTIONS,
  PublicationLogAction,
  ArticleStatus,
} from "@/lib/articles/constants";

interface ILogActor {
  id?: string;
  name?: string;
  role?: string;
}

export interface IPublicationLog extends Document {
  article: mongoose.Types.ObjectId;
  action: PublicationLogAction;
  fromStatus?: ArticleStatus;
  toStatus?: ArticleStatus;
  note?: string;
  actor?: ILogActor;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationLogSchema = new mongoose.Schema<IPublicationLog>(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: PUBLICATION_LOG_ACTIONS,
      required: true,
      index: true,
    },
    fromStatus: { type: String, required: false },
    toStatus: { type: String, required: false },
    note: { type: String, default: "" },
    actor: {
      id: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "" },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PublicationLogSchema.index({ article: 1, createdAt: -1 });

const PublicationLog: Model<IPublicationLog> =
  mongoose.models.PublicationLog ||
  mongoose.model<IPublicationLog>("PublicationLog", PublicationLogSchema);

export default PublicationLog;
