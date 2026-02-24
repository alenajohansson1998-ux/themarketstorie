import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import { z } from 'zod';

// CSV row validation schema
const PriceBarSchema = z.object({
  instrument: z.string().min(1),
  timestamp: z.string().transform((str) => new Date(str)),
  open: z.string().transform((str) => parseFloat(str)),
  high: z.string().transform((str) => parseFloat(str)),
  low: z.string().transform((str) => parseFloat(str)),
  close: z.string().transform((str) => parseFloat(str)),
  volume: z.string().transform((str) => parseInt(str)).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be CSV' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['instrument', 'timestamp', 'open', 'high', 'low', 'close', 'volume'];

    // Check if all expected headers are present
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({
        error: `Missing required headers: ${missingHeaders.join(', ')}`
      }, { status: 400 });
    }

    const priceBars = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Incorrect number of columns`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      try {
        const validatedBar = PriceBarSchema.parse(rowData);
        priceBars.push({
          instrument: validatedBar.instrument,
          timestamp: validatedBar.timestamp,
          open: validatedBar.open,
          high: validatedBar.high,
          low: validatedBar.low,
          close: validatedBar.close,
          volume: validatedBar.volume || 0,
        });
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation errors found',
        details: errors.slice(0, 10), // Show first 10 errors
        totalErrors: errors.length
      }, { status: 400 });
    }

    if (priceBars.length === 0) {
      return NextResponse.json({ error: 'No valid price bars to import' }, { status: 400 });
    }

    // Insert into time-series collection
    const db = (global as any).mongoose.connection.db;
    const collection = db.collection('price_bars_1m');

    const result = await collection.insertMany(priceBars);

    return NextResponse.json({
      message: `Successfully imported ${result.insertedCount} price bars`,
      insertedCount: result.insertedCount
    });

  } catch (error) {
    console.error('Error importing price bars:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
