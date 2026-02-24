import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tag from '@/models/Tag';

/**
 * GET /api/cms/tags/[id] - Get a single tag
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const tag = await Tag.findById(id);

    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cms/tags/[id] - Update a tag (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const tag = await Tag.findById(id);
    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, slug, description, color } = body;

    if (name && name !== tag.name) {
      const existing = await Tag.findOne({ name });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Tag name already exists' },
          { status: 400 }
        );
      }
      tag.name = name;
    }

    if (slug && slug !== tag.slug) {
      const existing = await Tag.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
      tag.slug = slug;
    }

    if (description !== undefined) tag.description = description;
    if (color !== undefined) tag.color = color;

    await tag.save();

    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cms/tags/[id] - Delete a tag (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
