import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Sign-up only. The subscriber list is deliberately not readable from a public route.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const source = typeof body.source === 'string' ? body.source.slice(0, 40) : 'subscription-page';

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  try {
    await dbConnect();
    await NewsletterSubscriber.updateOne(
      { email },
      { $setOnInsert: { email, source, createdAt: new Date() } },
      { upsert: true }
    );
    // Same response whether the address is new or already subscribed.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter signup failed', error);
    return NextResponse.json({ error: 'We couldn’t add you right now. Try again in a moment.' }, { status: 500 });
  }
}
