import mongoose, { Model } from 'mongoose';

export interface IInstrument {
  _id: string; // "<SYMBOL>.<EXCHANGE>"
  symbol: string;
  exchange: string;
  display_symbol: string;
  name: string;
  type: string; // e.g., 'stock', 'crypto', 'forex'
  sector?: string;
  tick_size: number;
  market_cap?: number;
  identifiers: {
    isin?: string;
    cusip?: string;
    sedol?: string;
  };
  last_updated: Date;
}

const InstrumentSchema = new mongoose.Schema<IInstrument>({
  _id: { type: String, required: true },
  symbol: { type: String, required: true },
  exchange: { type: String, required: true },
  display_symbol: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  sector: { type: String },
  tick_size: { type: Number, required: true },
  market_cap: { type: Number },
  identifiers: {
    isin: { type: String },
    cusip: { type: String },
    sedol: { type: String },
  },
  last_updated: { type: Date, default: Date.now },
});

const Instrument: Model<IInstrument> = mongoose.models.Instrument || mongoose.model<IInstrument>('Instrument', InstrumentSchema);

export default Instrument;
