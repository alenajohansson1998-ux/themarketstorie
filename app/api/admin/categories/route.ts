import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, parent, showInHeader, isMainHeader } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug already exists
    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      slug,
      parent: parent || undefined,
      showInHeader: showInHeader || false,
      isMainHeader: isMainHeader || false,
    });

    await category.save();

    const newCategory = await Category.findById(category._id).populate('parent', 'name');

    return NextResponse.json({ category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const categories = await Category.find().populate('parent', 'name').sort({ createdAt: -1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
