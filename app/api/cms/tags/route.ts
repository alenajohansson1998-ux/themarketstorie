import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tag from '@/models/Tag';

/**
 * GET /api/cms/tags - List tags
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const tags = await Tag.find({}).sort('name').lean();

    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/tags - Create a new tag (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { name, slug, description, color } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const existingTag = await Tag.findOne({ $or: [{ name }, { slug }] });
    if (existingTag) {
      return NextResponse.json(
        { success: false, error: 'Tag name or slug already exists' },
        { status: 400 }
      );
    }

    const tag = new Tag({
      name,
      slug,
      description,
      color: color || '#3B82F6',
    });

    await tag.save();

    return NextResponse.json(
      { success: true, data: tag },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
