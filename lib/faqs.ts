import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { commitFile, getFileSha, deleteFile, getFileContent, listDirectory } from './github';

const faqsDirectory = path.join(process.cwd(), 'content/faqs');

export interface FAQMetadata {
  id: string;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  order: number;
  createdAt: string;
  relatedTo: string;
}

export interface FAQ extends FAQMetadata {}

export function ensureFAQsDirectory() {
  if (!fs.existsSync(faqsDirectory)) {
    fs.mkdirSync(faqsDirectory, { recursive: true });
  }
}

export async function getAllFAQs(): Promise<FAQ[]> {
  try {
    const fileNames = await listDirectory('content/faqs');
    const allFAQs = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map(async (fileName) => {
          const id = fileName.replace(/\.mdx$/, '');
          const filePath = `content/faqs/${fileName}`;
          const fileContents = await getFileContent(filePath);
          if (!fileContents) return null;

          const { data } = matter(fileContents);

          return {
            id,
            question: data.question || '',
            answer: data.answer || '',
            category: data.category || 'General',
            published: data.published || false,
            order: data.order || 0,
            createdAt: data.createdAt || new Date().toISOString(),
            relatedTo: data.relatedTo || 'homepage',
          };
        })
    );

    return allFAQs
      .filter((faq): faq is FAQ => faq !== null)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error reading FAQs:', error);
    return [];
  }
}

export async function getPublishedFAQs(): Promise<FAQ[]> {
  const allFAQs = await getAllFAQs();
  return allFAQs.filter((faq) => faq.published);
}

export async function getFAQById(id: string): Promise<FAQ | null> {
  try {
    const filePath = `content/faqs/${id}.mdx`;
    const fileContents = await getFileContent(filePath);
    if (!fileContents) return null;

    const { data } = matter(fileContents);

    return {
      id,
      question: data.question || '',
      answer: data.answer || '',
      category: data.category || 'General',
      published: data.published || false,
      order: data.order || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      relatedTo: data.relatedTo || 'homepage',
    };
  } catch (error) {
    return null;
  }
}

export async function saveFAQ(id: string, metadata: Omit<FAQMetadata, 'id'>) {
  const frontmatter = matter.stringify('', {
    question: metadata.question,
    answer: metadata.answer,
    category: metadata.category,
    published: metadata.published,
    order: metadata.order,
    createdAt: metadata.createdAt,
    relatedTo: metadata.relatedTo,
  });

  const filePath = `content/faqs/${id}.mdx`;
  await commitFile(filePath, frontmatter, `Update FAQ: ${id}`);
}

export async function deleteFAQ(id: string) {
  const filePath = `content/faqs/${id}.mdx`;
  await deleteFile(filePath, `Delete FAQ: ${id}`);
}

export function getFAQsByCategory(category: string): FAQ[] {
  const allFAQs = getPublishedFAQs();
  if (category === 'All') {
    return allFAQs;
  }
  return allFAQs.filter((faq) => faq.category === category);
}

export function getAllFAQCategories(): string[] {
  const allFAQs = getAllFAQs();
  const categories = new Set<string>();
  allFAQs.forEach((faq) => categories.add(faq.category));
  return ['All', ...Array.from(categories).sort()];
}

export async function getFAQsByPage(pageName: string): Promise<FAQ[]> {
  const allFAQs = await getPublishedFAQs();
  return allFAQs.filter((faq) => faq.relatedTo === pageName);
}
