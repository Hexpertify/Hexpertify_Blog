function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

export function getPublicBlogPath(slug?: string): string {
  const cleanSlug = trimSlashes(slug || '');

  // ✅ FINAL FIX: always take last part
  const finalSlug = cleanSlug.split('/').pop();

  if (!finalSlug) return '/blogs';

  return `/blogs/${finalSlug}`;
}

export function getPublicBlogUrl(siteUrl: string, slug?: string): string {
  const origin = siteUrl.replace(/\/$/, '');
  const path = getPublicBlogPath(slug);

  return `${origin}${path}`;
}