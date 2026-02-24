import mongoose, { Document, Model } from 'mongoose';

export interface IIndex extends Omit<mongoose.Document, '_id'> {
  _id: string; // e.g., 'NIFTY50'
  name: string;
  exchange: string;
  members: Array<{
    instrument: string; // instrument _id
    weight: number;
  }>;
  last_updated: Date;
}

const IndexSchema = new mongoose.Schema<IIndex>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  exchange: { type: String, required: true },
  members: [{
    instrument: { type: String, required: true },
    weight: { type: Number, required: true, min: 0, max: 100 },
  }],
  last_updated: { type: Date, default: Date.now },
});

const Index: Model<IIndex> = mongoose.models.Index || mongoose.model<IIndex>('Index', IndexSchema);

export default Index;
