import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getRedis } from '@/lib/redis';

export async function GET() {
  try {
    // Check MongoDB
    await dbConnect();
    const mongoStatus = 'connected';

    // Check Redis
    const redis = getRedis();
    await redis.ping();
    const redisStatus = 'connected';

    return NextResponse.json({
      status: 'healthy',
      database: mongoStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
