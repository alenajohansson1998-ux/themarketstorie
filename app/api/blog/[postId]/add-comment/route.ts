import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import { authConfig } from '@/auth.config';
import Comment from '@/models/Comment';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Comment text is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newComment = new Comment({
      postId,
      userId: session.user.id,
      userName: session.user.name,
      text: text.trim()
    });

    console.log('Creating comment:', { postId, userId: session.user.id, userName: session.user.name, text: text.trim() });
    await newComment.save();
    console.log('Comment saved successfully:', newComment._id);

    return NextResponse.json({
      success: true,
      comment: newComment
    });

  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
