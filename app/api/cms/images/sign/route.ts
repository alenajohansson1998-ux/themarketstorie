import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';
import { createCloudinaryUploadSignature } from '@/lib/cloudinary-signing';
import { validateCmsImage } from '@/lib/cms-images';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Please sign in to upload images.' }, { status: 401 });
  }

  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid upload origin.' }, { status: 403 });
  }

  const image = await request.json().catch(() => null);
  if (typeof image?.type !== 'string' || !Number.isSafeInteger(image?.size) || image.size < 0) {
    return NextResponse.json({ error: 'Choose a valid image file.' }, { status: 400 });
  }
  try {
    validateCmsImage(image);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  try {
    return NextResponse.json(createCloudinaryUploadSignature(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }
}
