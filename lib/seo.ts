import fs from 'fs';
import path from 'path';
import { commitFile, getFileSha, deleteFile } from './github';

const seoDirectory = path.join(process.cwd(), 'content/seo');

export interface SEOMetadata {
  page: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
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

export function getAllSEOPages(): SEOMetadata[] {
  try {
    ensureSEODirectory();

    const fileNames = fs.readdirSync(seoDirectory);
    const allSEO = fileNames
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => {
        const page = fileName.replace(/\.json$/, '');
        const fullPath = path.join(seoDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(fileContents);

        return {
          page,
          ...data,
        } as SEOMetadata;
      })
      .sort((a, b) => a.page.localeCompare(b.page));

    return allSEO;
  } catch (error) {
    console.error('Error reading SEO pages:', error);
    return [];
  }
}

export function getSEOByPage(page: string): SEOMetadata | null {
  try {
    ensureSEODirectory();

    const fullPath = path.join(seoDirectory, `${page}.json`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(fileContents);

    return {
      page,
      ...data,
    } as SEOMetadata;
  } catch (error) {
    return null;
  }
}

export function saveSEO(page: string, metadata: Omit<SEOMetadata, 'page'>) {
  const data = {
    title: metadata.title,
    description: metadata.description,
    ogTitle: metadata.ogTitle || metadata.title,
    ogDescription: metadata.ogDescription || metadata.description,
    ogImage: metadata.ogImage || '',
    ogType: metadata.ogType || 'website',
    twitterCard: metadata.twitterCard || 'summary_large_image',
    twitterTitle: metadata.twitterTitle || metadata.title,
    twitterDescription: metadata.twitterDescription || metadata.description,
    twitterImage: metadata.twitterImage || metadata.ogImage || '',
    keywords: metadata.keywords || '',
    canonicalUrl: metadata.canonicalUrl || '',
    robots: metadata.robots || 'index, follow',
    updatedAt: new Date().toISOString(),
  };

  const filePath = `content/seo/${page}.json`;
  commitFile(filePath, JSON.stringify(data, null, 2), `Update SEO: ${page}`);
}

export function deleteSEO(page: string) {
  const filePath = `content/seo/${page}.json`;
  deleteFile(filePath, `Delete SEO: ${page}`);
}

export function getDefaultSEO(): Omit<SEOMetadata, 'page'> {
  return {
    title: 'Hexpertify - Connect with Certified Experts',
    description: 'Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development. Get personalized consulting and expert guidance.',
    ogTitle: 'Hexpertify - Connect with Certified Experts',
    ogDescription: 'Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development.',
    ogImage: 'https://bolt.new/static/og_default.png',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Hexpertify - Connect with Certified Experts',
    twitterDescription: 'Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development.',
    twitterImage: 'https://bolt.new/static/og_default.png',
    keywords: 'experts, consulting, AI, cloud computing, mental health, fitness, career development',
    canonicalUrl: '',
    robots: 'index, follow',
    updatedAt: new Date().toISOString(),
  };
}
