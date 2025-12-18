import { getSEOByPage, getDefaultSEO } from '@/lib/seo';

interface SEOHeadProps {
  page: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export default async function SEOHead({ page, fallbackTitle, fallbackDescription }: SEOHeadProps) {
  let seo = await getSEOByPage(page);

  if (!seo) {
    const defaultSEO = getDefaultSEO();
    seo = {
      page,
      title: fallbackTitle || defaultSEO.title,
      description: fallbackDescription || defaultSEO.description,
      ogTitle: fallbackTitle || defaultSEO.ogTitle || defaultSEO.title,
      ogDescription: fallbackDescription || defaultSEO.ogDescription || defaultSEO.description,
      ogImage: defaultSEO.ogImage || '',
      ogType: defaultSEO.ogType || 'website',
      twitterCard: defaultSEO.twitterCard || 'summary_large_image',
      twitterTitle: fallbackTitle || defaultSEO.twitterTitle || defaultSEO.title,
      twitterDescription: fallbackDescription || defaultSEO.twitterDescription || defaultSEO.description,
      twitterImage: defaultSEO.twitterImage || defaultSEO.ogImage || '',
      keywords: defaultSEO.keywords || '',
      canonicalUrl: defaultSEO.canonicalUrl || '',
      robots: defaultSEO.robots || 'index, follow',
      updatedAt: defaultSEO.updatedAt,
    };
  }
  // Ensure canonical is always provided and uses SITE_URL when missing
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hexpertify.com';

  function pageToPath(p: string) {
    if (p === 'homepage') return '/';
    if (p.startsWith('blog-')) return `/blog/${p.replace(/^blog-/, '')}`;
    return `/${p.replace(/-/g, '/')}`;
  }

  const canonical = seo.canonicalUrl && seo.canonicalUrl !== '' ? seo.canonicalUrl : `${SITE_URL}${pageToPath(page)}`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: seo.ogType as any,
    },
    twitter: {
      card: seo.twitterCard as any,
      title: seo.twitterTitle || seo.title,
      description: seo.twitterDescription || seo.description,
      images: seo.twitterImage ? [seo.twitterImage] : [],
    },
    robots: seo.robots,
    alternates: {
      canonical,
    },
  };
}
