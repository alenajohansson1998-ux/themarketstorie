import mongoose from 'mongoose';

const AdvertisingEnquirySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  company:   { type: String, default: '' },
  email:     { type: String, required: true },
  format:    { type: String, default: '' },
  message:   { type: String, required: true },
  status:    { type: String, enum: ['new', 'reviewed'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AdvertisingEnquiry ||
  mongoose.model('AdvertisingEnquiry', AdvertisingEnquirySchema);
