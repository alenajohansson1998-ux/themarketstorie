import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import NavItem from '@/models/NavItem';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    const navItems = await NavItem.find({}).sort({ order: 1 });
    return NextResponse.json({ navItems });
  } catch (error) {
    console.error('Error fetching nav items:', error);
    return NextResponse.json({ error: 'Failed to fetch nav items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { name, href, order, isActive } = await request.json();

    if (!name || !href) {
      return NextResponse.json({ error: 'Name and href are required' }, { status: 400 });
    }

    const navItem = new NavItem({
      name,
      href,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await navItem.save();
    return NextResponse.json({ navItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating nav item:', error);
    return NextResponse.json({ error: 'Failed to create nav item' }, { status: 500 });
  }
}
