import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { userId, credits } = await req.json();
    if (!userId || typeof credits !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing userId or credits' }, { status: 400 });
    }
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    user.postCredits = credits;
    await user.save();
    return NextResponse.json({ success: true, credits: user.postCredits });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update credits' }, { status: 500 });
  }
}
