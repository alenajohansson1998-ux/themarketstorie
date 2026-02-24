import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import User from '@/models/User';

/**
 * WARNING: This endpoint creates test data for development only.
 * Should be deleted or protected in production!
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Check if admin user exists, if not create one
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashed_password', // In production, use proper hashing
        role: 'admin',
      });
      console.log('Created admin user:', adminUser._id);
    }

    // Create sample categories if none exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categories = await Category.insertMany([
        {
          name: 'News',
          slug: 'news',
          description: 'Latest news and updates',
        },
        {
          name: 'Technology',
          slug: 'technology',
          description: 'Tech news and reviews',
        },
        {
          name: 'Business',
          slug: 'business',
          description: 'Business and finance',
        },
        {
          name: 'Lifestyle',
          slug: 'lifestyle',
          description: 'Lifestyle and wellness',
        },
      ]);
      console.log('Created categories:', categories.map((c) => c._id));
    }

    // Create sample tags if none exist
    const tagCount = await Tag.countDocuments();
    if (tagCount === 0) {
      const tags = await Tag.insertMany([
        { name: 'Breaking News', slug: 'breaking-news' },
        { name: 'Featured', slug: 'featured' },
        { name: 'Analysis', slug: 'analysis' },
        { name: 'Interview', slug: 'interview' },
        { name: 'Opinion', slug: 'opinion' },
      ]);
      console.log('Created tags:', tags.map((t) => t._id));
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized with sample data',
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
