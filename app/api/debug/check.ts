import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authConfig);
    const categoryCount = await Category.countDocuments();
    const tagCount = await Tag.countDocuments();
    const userCount = await User.countDocuments();

    const categories = await Category.find().lean().limit(5);
    const tags = await Tag.find().lean().limit(5);

    return NextResponse.json({
      success: true,
      session: {
        authenticated: !!session,
        user: session?.user,
      },
      database: {
        categoryCount,
        tagCount,
        userCount,
        categories,
        tags,
      },
    });
  } catch (error: any) {
    console.error('Debug check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error',
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}
