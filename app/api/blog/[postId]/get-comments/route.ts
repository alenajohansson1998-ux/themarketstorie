import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    console.log('GET get-comments request for postId:', postId);
    await dbConnect();

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('Found comments count:', comments.length);
    console.log('Comments:', comments.map(c => ({ id: c._id, text: c.text, userName: c.userName })));

    return NextResponse.json({
      success: true,
      comments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
