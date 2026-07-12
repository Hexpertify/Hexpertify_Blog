function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

export function getPublicAssetPath(assetPath: string): string {
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  const basePath = process.env.NODE_ENV === 'production' ? '/blogs' : '';
  return `${basePath}${cleanPath}`;
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