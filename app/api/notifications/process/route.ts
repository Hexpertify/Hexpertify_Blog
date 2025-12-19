import { NextResponse } from 'next/server';

// Notifications email workflow disabled: endpoint kept as a no-op
export async function POST() {
  return NextResponse.json({ ok: true, processed: 0, message: 'Notification email workflow disabled' });
}
