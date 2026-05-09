import { NextResponse } from 'next/server';
import AdvertisingEnquiry from '@/models/AdvertisingEnquiry';
import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  await dbConnect();
  const { name, company, email, format, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
  }
  try {
    const enquiry = await AdvertisingEnquiry.create({ name, company, email, format, message });
    return NextResponse.json({ success: true, enquiry });
  } catch {
    return NextResponse.json({ error: 'Failed to submit enquiry.' }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  const enquiries = await AdvertisingEnquiry.find().sort({ createdAt: -1 });
  return NextResponse.json(enquiries);
}

export async function PATCH(req: Request) {
  await dbConnect();
  const { id, status } = await req.json();
  const updated = await AdvertisingEnquiry.findByIdAndUpdate(id, { status }, { new: true });
  return NextResponse.json(updated);
}
