import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongodb';
import { authConfig } from '@/auth.config';
import Like from '@/models/Like';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authConfig);

    await dbConnect();

    let userId: string;

    if (session?.user) {
      // Authenticated user
      userId = session.user.id;
    } else {
      // Anonymous user - use IP address as identifier
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ip = forwarded ? forwarded.split(',')[0] : realIp || 'anonymous';
      userId = `anon_${ip}`;
    }

    // Check if user already liked this post
    const existingLike = await Like.findOne({
      postId,
      userId
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, message: 'Already liked' },
        { status: 400 }
      );
    }

    // Add like
    const newLike = new Like({
      postId,
      userId
    });

    await newLike.save();

    // Get total likes count
    const likesCount = await Like.countDocuments({
      postId
    });

    return NextResponse.json({
      success: true,
      likes: likesCount
    });

  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    await dbConnect();

    const likesCount = await Like.countDocuments({
      postId
    });

    const session = await getServerSession(authConfig);
    let hasLiked = false;

    if (session?.user) {
      const existingLike = await Like.findOne({
        postId,
        userId: session.user.id
      });
      hasLiked = !!existingLike;
    }

    return NextResponse.json({
      success: true,
      likes: likesCount,
      hasLiked
    });

  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
