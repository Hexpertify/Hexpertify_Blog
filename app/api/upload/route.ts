import { NextResponse } from 'next/server';
import { commitBinaryFile, getGithubRawUrl } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      const message = 'GitHub not configured. Set GITHUB_TOKEN and related repo vars.';
      console.error('Upload API error: GitHub env missing');
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

    const originalName: string = file.name || `upload-${Date.now()}`;
    const fileExt = originalName.includes('.') ? originalName.split('.').pop() : undefined;
    const safeExt = fileExt ? `.${fileExt}` : '';

    const baseDir = process.env.GITHUB_ASSETS_PATH_PREFIX || 'assets/uploads';
    const filePath = `${baseDir}/${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await commitBinaryFile(filePath, bytes, `Upload image: ${originalName}`);

    const url = getGithubRawUrl(filePath);

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Upload API error:', err);
    const message = err?.message || String(err) || 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
