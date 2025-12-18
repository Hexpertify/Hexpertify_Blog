import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const TOKEN_ENV_NAMES = ['BLOB_READ_WRITE_TOKEN', 'VERCEL_BLOB_TOKEN', 'VERCEL_TOKEN', 'VERCEL_BLOB_UPLOAD_TOKEN'];

function getBlobToken(): string | undefined {
  for (const name of TOKEN_ENV_NAMES) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const token = getBlobToken();
    if (!token) {
      const message =
        'Vercel Blob token not configured. Create a token in Vercel (Account → Tokens) and add it to Project Settings as `VERCEL_BLOB_TOKEN`. See https://vercel.com/docs/storage/blob#using-the-api';
      console.error('Upload API error: token missing');
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as any;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Basic validation
    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size && file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 });
    }

    if (file.type && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    const fileName = file.name || `upload-${Date.now()}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Pass token option directly to put to avoid relying on env mutation
    const result = await put(`blog-images/${Date.now()}-${fileName}`, uint8, {
      access: 'public',
      token,
    });

    if (!result?.url) {
      console.error('Upload API error: no url in result', result);
      return NextResponse.json({ error: 'Upload succeeded but no URL returned' }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (err: any) {
    console.error('Upload API error:', err);
    const message = err?.message || String(err) || 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
