const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsday';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create time-series collection for price_bars_1m
    await db.createCollection('price_bars_1m', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'minutes'
      }
    });

    // Create indexes for price_bars_1m
    await db.collection('price_bars_1m').createIndex({ 'metadata.symbol': 1, timestamp: -1 });

    // Create time-series collection for ticks
    await db.createCollection('ticks', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'seconds'
      }
    });

    // Create indexes for ticks
    await db.collection('ticks').createIndex({ 'metadata.symbol': 1, timestamp: -1 });

    console.log('Time-series collections created successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
