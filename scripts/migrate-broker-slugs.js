// Usage: node scripts/migrate-broker-slugs.js
const mongoose = require('mongoose');
const Broker = require('../models/Broker').default;

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsday';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function migrateSlugs() {
  await mongoose.connect(MONGO_URI);
  const brokers = await Broker.find({});
  let updated = 0;
  for (const broker of brokers) {
    if (!broker.slug) {
      broker.slug = slugify(broker.name);
      await broker.save();
      updated++;
      console.log(`Updated broker: ${broker.name} -> ${broker.slug}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} brokers.`);
  await mongoose.disconnect();
}

migrateSlugs().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
