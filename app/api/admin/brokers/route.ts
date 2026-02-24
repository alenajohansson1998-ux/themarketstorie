import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Broker from '@/models/Broker';
import dbConnect from '@/lib/mongodb';
import { authConfig } from '@/auth.config';

const BROKER_MUTABLE_FIELDS = new Set([
  'name',
  'slug',
  'logoUrl',
  'rating',
  'ratingText',
  'assets',
  'reviews',
  'accounts',
  'badge',
  'description',
  'regulator',
  'website',
  'phone',
  'address',
  'terms',
  'features',
  'faq',
  'banner',
  'bannerUrl',
]);

async function requireAdmin() {
  const session = await getServerSession(authConfig);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function parseNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const normalized = val.trim().toUpperCase();
    if (normalized.endsWith('K')) return parseFloat(normalized) * 1000;
    if (normalized.endsWith('M')) return parseFloat(normalized) * 1000000;
    return parseFloat(normalized);
  }
  return 0;
}

function buildBrokerUpdate(body: Record<string, unknown>) {
  const updateFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (BROKER_MUTABLE_FIELDS.has(key)) {
      updateFields[key] = value;
    }
  }

  if (typeof updateFields.bannerUrl === 'string' && updateFields.bannerUrl) {
    updateFields.banner = updateFields.bannerUrl;
  }
  delete updateFields.bannerUrl;

  return updateFields;
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await dbConnect();
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing broker id' }, { status: 400 });
  }

  const body = await req.json();
  const updateFields = buildBrokerUpdate(body);
  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const updated = await Broker.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Broker not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, broker: updated });
  } catch (error) {
    console.error('[PUT /api/admin/brokers] Error updating broker:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await dbConnect();
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing broker id' }, { status: 400 });
  }
  const deleted = await Broker.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Broker not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await dbConnect();
  const body = await req.json();
  const {
    name,
    logoUrl = '/default-broker-logo.svg',
    bannerUrl,
    rating,
    ratingText,
    assets,
    reviews,
    accounts,
    badge,
    description,
    regulator,
    website,
    phone,
    address,
    terms,
    features,
    faq,
  } = body;

  if (!name || rating === undefined || !ratingText || !assets || reviews === undefined || !accounts) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  const parsedRating = parseFloat(String(rating));
  if (Number.isNaN(parsedRating)) {
    return NextResponse.json({ success: false, error: 'Invalid rating value' }, { status: 400 });
  }

  const slug =
    body.slug ||
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const broker = new Broker({
    name,
    slug,
    logoUrl,
    banner: bannerUrl,
    rating: parsedRating,
    ratingText,
    assets,
    reviews: parseNumber(reviews),
    accounts,
    badge,
    description,
    regulator,
    website,
    phone,
    address,
    terms,
    features,
    faq,
  });
  await broker.save();
  return NextResponse.json({ success: true, broker });
}

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');
  const slug = url.searchParams.get('slug');
  if (slug) {
    const broker = await Broker.findOne({ slug }).lean();
    if (!broker) {
      return NextResponse.json({ broker: null }, { status: 404 });
    }
    return NextResponse.json({ broker });
  }
  if (id) {
    const broker = await Broker.findById(id);
    if (!broker) {
      return NextResponse.json({ broker: null }, { status: 404 });
    }
    return NextResponse.json({ broker });
  }
  const brokers = await Broker.find({});
  return NextResponse.json({ brokers });
}
