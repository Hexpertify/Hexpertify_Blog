import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toString().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase.from('subscribers').insert([{ email }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: 'Hexpertify Blog <newsletter@hexpertify.com>',
        to: email,
        subject: 'Welcome to Hexpertify Blog Newsletter!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Hexpertify Blog</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #450BC8; margin-bottom: 10px;">Welcome to Hexpertify Blog! 🎉</h1>
                <p style="font-size: 18px; color: #666;">Thank you for subscribing to our newsletter</p>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #450BC8; margin-top: 0;">What to expect:</h2>
                <ul style="padding-left: 20px;">
                  <li>Weekly insights on AI, Cloud Computing, and emerging technologies</li>
                  <li>Expert tips and tutorials</li>
                  <li>Industry trends and analysis</li>
                  <li>Career advice for tech professionals</li>
                  <li>Exclusive content and early access</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://hexpertify.com/blog" style="background-color: #450BC8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Our Blog</a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                <p>You can unsubscribe at any time by replying to this email.</p>
                <p>© 2025 Hexpertify. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
