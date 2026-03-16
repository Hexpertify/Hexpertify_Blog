import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Redirect `/blogs/blog/<slug>` -> `/blogs/<slug>`
  if (pathname.startsWith('/blogs/blog/')) {
    url.pathname = pathname.replace('/blogs/blog/', '/blogs/');
    return NextResponse.redirect(url);
  }

  // Also handle an extra `/blog/` under `/blogs` (defensive)
  if (pathname.startsWith('/blogs/blogs/')) {
    url.pathname = pathname.replace('/blogs/blogs/', '/blogs/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blogs/:path*', '/blog/:path*'],
};
