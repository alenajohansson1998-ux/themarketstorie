import { NextResponse } from 'next/server';
import ContactRequest from '@/models/ContactRequest';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  await dbConnect();
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  try {
    const contact = await ContactRequest.create({ name, email, message });
    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  const requests = await ContactRequest.find().sort({ createdAt: -1 });
  return NextResponse.json(requests);
}
