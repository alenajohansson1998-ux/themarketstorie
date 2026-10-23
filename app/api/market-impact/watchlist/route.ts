import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import dbConnect from '@/lib/mongodb';
import RadarWatchlist from '@/models/RadarWatchlist';
import { MAX_RADAR_FOLLOWS, normalizeRadarWatchlist, parseRadarWatchlistMutation } from '@/lib/market-impact/watchlist';

export const runtime = 'nodejs';
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to access your account watchlist.' }, { status: 401, headers: privateHeaders });
    await dbConnect();
    const data = await RadarWatchlist.findOne({ userId: session.user.id }).select('eventSlugs entityIds -_id').lean();
    return NextResponse.json(normalizeRadarWatchlist(data), { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: 'Could not load your account watchlist. Please try again.' }, { status: 503, headers: privateHeaders });
  }
}

export async function PUT(request: NextRequest) {
  // Session cookies are SameSite=Lax; also reject cross-origin write requests.
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save an account watchlist.' }, { status: 401, headers: privateHeaders });
    let mutation;
    try {
      const text = await request.text();
      if (text.length > 1_024) throw new Error('Watchlist change is too large.');
      mutation = parseRadarWatchlistMutation(JSON.parse(text));
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid watchlist change.' }, { status: 400, headers: privateHeaders });
    }
    await dbConnect();
    const userId = session.user.id;
    // Initialize without merging any browser state. A unique userId prevents duplicates.
    try {
      await RadarWatchlist.updateOne({ userId }, { $setOnInsert: { userId, eventSlugs: [], entityIds: [] } }, { upsert: true });
    } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error;
    }
    const field = mutation.kind === 'event' ? 'eventSlugs' : 'entityIds';
    const filter = mutation.following ? {
      userId,
      $or: [
        { [field]: mutation.id },
        { $expr: { $lt: [{ $add: [{ $size: { $ifNull: ['$eventSlugs', []] } }, { $size: { $ifNull: ['$entityIds', []] } }] }, MAX_RADAR_FOLLOWS] } },
      ],
    } : { userId };
    // Capacity and set insertion share one atomic update, including concurrent tabs.
    const update = mutation.following ? { $addToSet: { [field]: mutation.id } } : { $pull: { [field]: mutation.id } };
    const data = await RadarWatchlist.findOneAndUpdate(filter, update, { new: true, runValidators: true }).select('eventSlugs entityIds -_id').lean();
    if (!data) return NextResponse.json({ error: 'Your watchlist can hold up to 100 events and entities. Unfollow one to add another.' }, { status: 409, headers: privateHeaders });
    return NextResponse.json(normalizeRadarWatchlist(data), { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: 'Could not save your account watchlist. Please try again.' }, { status: 503, headers: privateHeaders });
  }
}
