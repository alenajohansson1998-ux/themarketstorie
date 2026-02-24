import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

/**
 * GET /api/cms/categories - List categories
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const includeParent = searchParams.get('includeParent') === 'true';

    let query = Category.find({}).sort('name');

    if (includeParent) {
      query = query.populate('parent', 'name slug');
    }

    const categories = await query.lean();
    // Ensure plain JSON response, not wrapped in Content property
    return new NextResponse(JSON.stringify({ success: true, data: categories }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cms/categories - Create a new category (admin only)
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
    const { name, slug, description, parent, showInHeader, isMainHeader } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category name or slug already exists' },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      slug,
      description,
      parent: parent || null,
      showInHeader: showInHeader || false,
      isMainHeader: isMainHeader || false,
    });

    await category.save();
    await category.populate('parent', 'name slug');

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
