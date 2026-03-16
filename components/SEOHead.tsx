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
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: 'hexpertify-blogs',
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
    // canonical URLs are generated from `metadataBase` in the root layout
  };
}
