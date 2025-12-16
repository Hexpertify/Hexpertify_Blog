import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { commitFile, getFileSha, deleteFile } from './github';

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

export function getAllFAQs(): FAQ[] {
  try {
    ensureFAQsDirectory();

    const fileNames = fs.readdirSync(faqsDirectory);
    const allFAQs = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const id = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(faqsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
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
      .sort((a, b) => a.order - b.order);

    return allFAQs;
  } catch (error) {
    console.error('Error reading FAQs:', error);
    return [];
  }
}

export function getPublishedFAQs(): FAQ[] {
  const allFAQs = getAllFAQs();
  return allFAQs.filter((faq) => faq.published);
}

export function getFAQById(id: string): FAQ | null {
  try {
    ensureFAQsDirectory();

    const fullPath = path.join(faqsDirectory, `${id}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
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

export function saveFAQ(id: string, metadata: Omit<FAQMetadata, 'id'>) {
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
  commitFile(filePath, frontmatter, `Update FAQ: ${id}`);
}

export function deleteFAQ(id: string) {
  const filePath = `content/faqs/${id}.mdx`;
  deleteFile(filePath, `Delete FAQ: ${id}`);
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

export function getFAQsByPage(pageName: string): FAQ[] {
  const allFAQs = getPublishedFAQs();
  return allFAQs.filter((faq) => faq.relatedTo === pageName);
}
