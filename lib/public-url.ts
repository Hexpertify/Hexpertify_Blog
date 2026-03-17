function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

export function getPublicBlogPath(slug?: string): string {
  const cleanSlug = trimSlashes(slug || '');

  // always take last part (safe)
  const finalSlug = cleanSlug.split('/').pop();

  if (!finalSlug) return '/';

  // ❗ IMPORTANT: NO /blogs here
  return `/${finalSlug}`;
}

export function getPublicBlogUrl(siteUrl: string, slug?: string): string {
  const origin = siteUrl.replace(/\/$/, '');
  const path = getPublicBlogPath(slug);

  // basePath will automatically be applied by Next.js
  return `${origin}/blogs${path}`;
}