const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') return '';
  return `/${basePath.replace(/^\/+|\/+$/g, '')}`;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

export function getPublicBlogPath(slug?: string): string {
  const basePath = normalizeBasePath(PUBLIC_BASE_PATH);
  const cleanSlug = trimSlashes(slug || '');

  if (!cleanSlug) {
    return basePath || '/';
  }

  return `${basePath}/${cleanSlug}`;
}

export function getPublicBlogUrl(siteUrl: string, slug?: string): string {
  const origin = siteUrl.replace(/\/$/, '');
  const basePath = normalizeBasePath(PUBLIC_BASE_PATH);
  const cleanSlug = trimSlashes(slug || '');
  const originAlreadyIncludesBasePath = Boolean(basePath) && origin.endsWith(basePath);

  if (!cleanSlug) {
    return originAlreadyIncludesBasePath || !basePath ? (origin || '/') : `${origin}${basePath}`;
  }

  if (originAlreadyIncludesBasePath) {
    return `${origin}/${cleanSlug}`;
  }

  return `${origin}${getPublicBlogPath(cleanSlug)}`;
}