const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') return '';
  return `/${basePath.replace(/^\/+|\/+$/g, '')}`;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

/**
 * ✅ FIXED: Always returns correct blog path
 * Prevents /blogs/blogs/... issue permanently
 */
export function getPublicBlogPath(slug?: string): string {
  const cleanSlug = trimSlashes(slug || '');

  // 🚨 remove accidental "blogs/" duplication if present
  const finalSlug = cleanSlug.replace(/^blogs\//, '');

  if (!finalSlug) return '/blogs';

  return `/blogs/${finalSlug}`;
}

/**
 * Generates full URL (used for SEO / canonical)
 */
export function getPublicBlogUrl(siteUrl: string, slug?: string): string {
  const origin = siteUrl.replace(/\/$/, '');
  const path = getPublicBlogPath(slug);

  return `${origin}${path}`;
}