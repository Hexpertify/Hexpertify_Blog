import fs from 'fs';
import path from 'path';
import { commitFile, getFileSha, deleteFile, getFileContent, listDirectory } from './github';

const seoDirectory = path.join(process.cwd(), 'content/seo');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hexpertify.com';

function getPageUrl(page: string): string {
  if (page === 'homepage') return '/';
  if (page.startsWith('blog-')) {
    const slug = page.replace('blog-', '');
    return `/blog/${slug}`;
  }
  // Add more mappings as needed
  return `/${page.replace(/-/g, '/')}`;
}

export interface SEOMetadata {
  page: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string;
  updatedAt: string;
}

export function ensureSEODirectory() {
  if (!fs.existsSync(seoDirectory)) {
    fs.mkdirSync(seoDirectory, { recursive: true });
  }
}

export async function getAllSEOPages(): Promise<SEOMetadata[]> {
  try {
    const fileNames = await listDirectory('content/seo');
    const allSEO = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith('.json'))
        .map(async (fileName) => {
          const page = fileName.replace(/\.json$/, '');
          const filePath = `content/seo/${fileName}`;
          const fileContents = await getFileContent(filePath);
          if (!fileContents) return null;

          const data = JSON.parse(fileContents);

          return {
            page,
            ...data,
          } as SEOMetadata;
        })
    );

    return allSEO
      .filter((seo): seo is SEOMetadata => seo !== null)
      .sort((a, b) => a.page.localeCompare(b.page));
  } catch (error) {
    console.error('Error reading SEO pages:', error);
    return [];
  }
}

export async function getSEOByPage(page: string): Promise<SEOMetadata | null> {
  try {
    const filePath = `content/seo/${page}.json`;
    const fileContents = await getFileContent(filePath);
    if (!fileContents) return null;

    const data = JSON.parse(fileContents);

    return {
      page,
      ...data,
    } as SEOMetadata;
  } catch (error) {
    return null;
  }
}

export async function saveSEO(page: string, metadata: Omit<SEOMetadata, 'page'>) {
  const canonicalUrl = metadata.canonicalUrl || `${SITE_URL}${getPageUrl(page)}`;
  const data = {
    title: metadata.title,
    description: metadata.description,
    ogTitle: metadata.ogTitle || metadata.title,
    ogDescription: metadata.ogDescription || metadata.description,
    ogImage: metadata.ogImage || '',
    ogImageAlt: metadata.ogImageAlt || '',
    ogType: metadata.ogType || 'website',
    twitterCard: metadata.twitterCard || 'summary_large_image',
    twitterTitle: metadata.twitterTitle || metadata.title,
    twitterDescription: metadata.twitterDescription || metadata.description,
    twitterImage: metadata.twitterImage || metadata.ogImage || '',
    twitterImageAlt: metadata.twitterImageAlt || '',
    keywords: metadata.keywords || '',
    canonicalUrl,
    robots: metadata.robots || 'index, follow',
    updatedAt: new Date().toISOString(),
  };

  const filePath = `content/seo/${page}.json`;
  await commitFile(filePath, JSON.stringify(data, null, 2), `Update SEO: ${page}`);
}

export async function deleteSEO(page: string) {
  const filePath = `content/seo/${page}.json`;
  await deleteFile(filePath, `Delete SEO: ${page}`);
}

export function getDefaultSEO(): Omit<SEOMetadata, 'page'> {
  return {
    title: 'hexpertify-blogs - Connect with Certified Experts',
    description:
      'hexpertify-blogs - Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development. Get personalized consulting and expert guidance.',
    ogTitle: 'hexpertify-blogs - Connect with Certified Experts',
    ogDescription: 'hexpertify-blogs',
    ogImage: 'https://hexpertify-blog-sigma.vercel.app/assets/images/logo.png',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'hexpertify-blogs - Connect with Certified Experts',
    twitterDescription:
      'hexpertify-blogs - Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development.',
    twitterImage: 'https://hexpertify-blog-sigma.vercel.app/assets/images/logo.png',
    keywords: 'experts, consulting, AI, cloud computing, mental health, fitness, career development',
    canonicalUrl: '',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  };
}
