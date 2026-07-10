import { NextResponse } from 'next/server';
import { appendSubscriberEmail } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toString().trim();
    const pageLabel = (body.pageLabel || body.pagePath || 'unknown page').toString().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!pageLabel) {
      return NextResponse.json({ error: 'Page label is required' }, { status: 400 });
    }

    await appendSubscriberEmail(email, pageLabel);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
