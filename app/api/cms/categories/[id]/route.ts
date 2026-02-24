import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

/**
 * GET /api/cms/categories/[id] - Get a single category
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const category = await Category.findById(id).populate('parent', 'name slug');

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cms/categories/[id] - Update a category (admin only)
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

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, slug, description, parent, showInHeader, isMainHeader } = body;

    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Category name already exists' },
          { status: 400 }
        );
      }
      category.name = name;
    }

    if (slug && slug !== category.slug) {
      const existing = await Category.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
      category.slug = slug;
    }

    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent || null;
    if (showInHeader !== undefined) category.showInHeader = showInHeader;
    if (isMainHeader !== undefined) category.isMainHeader = isMainHeader;

    await category.save();
    await category.populate('parent', 'name slug');

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cms/categories/[id] - Delete a category (admin only)
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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
