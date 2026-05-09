import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import Like from '@/models/Like';
import Comment from '@/models/Comment';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'editor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [totalLikes, totalComments, recentComments] = await Promise.all([
      Like.countDocuments(),
      Comment.countDocuments(),
      Comment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json({ totalLikes, totalComments, recentComments });
  } catch (error) {
    console.error('Error fetching engagement stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await request.json();
    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
    }

    await dbConnect();
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
