import mongoose from 'mongoose';

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, default: 'subscription-page' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.NewsletterSubscriber ||
  mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
