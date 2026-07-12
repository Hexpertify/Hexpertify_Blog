import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { commitFile, deleteFile, getFileContent, listDirectory } from './github';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  author: string;
  authorDesignation?: string;
  authorBio?: string;
  authorAvatar?: string;
  authorAvatarAlt?: string;
  authorConsultationUrl?: string;
  authorDegreeQualification?: string;
  authorSocialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  primaryTopic?: string;
  reviewedBy?: {
    name: string;
    designation: string;
  };
  category: string;
  categories?: string[];
  imageUrl: string;
  imageAlt?: string;
  readTime: string;
  published: boolean;
  date: string;
  seoOgImageAlt?: string;
  tableOfContents?: Array<{
    id: number;
    title: string;
    anchor: string;
  }>;
}

export interface Post extends PostMetadata {
  content: string;
}

function normalizeCategories(metadata: Pick<PostMetadata, 'category'> & { categories?: string[] }) {
  const categories = Array.isArray(metadata.categories)
    ? metadata.categories
    : metadata.category
      ? [metadata.category]
      : [];

  return Array.from(
    new Set(
      categories
        .map((category) => category.trim())
        .filter((category) => category.length > 0)
    )
  );
}

export function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

// ✅ GET ALL POSTS
export async function getAllPosts(): Promise<Post[]> {
  try {
    const fileNames = await listDirectory('content/posts');

    const allPostsData = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map(async (fileName) => {

          // ✅ extract clean slug
          const fileSlug = fileName
            .split('/')
            .pop()!
            .replace(/\.mdx$/, '');

          const filePath = `content/posts/${fileSlug}.mdx`;

          // ✅ safe fetch with fallback
          let fileContents =
            await getFileContent(filePath) ||
            await getFileContent(`${fileSlug}.mdx`);

          if (!fileContents) {
            console.log("❌ Skipping file (not found):", fileSlug);
            return null;
          }

          const { data, content } = matter(fileContents);
          const categories = normalizeCategories(data as PostMetadata);

          return {
            ...(data as PostMetadata),
            category: categories[0] || (data as PostMetadata).category || '',
            categories,
            slug: fileSlug,
            content,
          };
        })
    );

    return allPostsData
      .filter((post): post is Post => post !== null)
      .sort((a, b) =>
        new Date(a.date) < new Date(b.date) ? 1 : -1
      );

  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

// ✅ ONLY PUBLISHED POSTS
export async function getPublishedPosts(): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.published);
}

// ✅ GET SINGLE POST (CRITICAL FIX)
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const cleanSlug = slug.split('/').pop()!;

    const possiblePaths = [
      `content/posts/${cleanSlug}.mdx`,
      `${cleanSlug}.mdx`,
    ];

    let fileContents: string | null = null;

    for (const p of possiblePaths) {
      fileContents = await getFileContent(p);
      if (fileContents) {
        console.log("✅ Found file at:", p);
        break;
      }
    }

    if (!fileContents) {
      console.log("❌ File not found for slug:", cleanSlug);
      return null;
    }

    const { data, content } = matter(fileContents);
    const categories = normalizeCategories(data as PostMetadata);

    return {
      ...(data as PostMetadata),
      category: categories[0] || (data as PostMetadata).category || '',
      categories,
      slug: cleanSlug,
      content,
    };

  } catch (error) {
    console.error("❌ Error in getPostBySlug:", error);
    return null;
  }
}

// ✅ SAVE POST
export async function savePost(slug: string, metadata: PostMetadata, content: string) {
  const cleanSlug = slug.split('/').pop()!;
  const categories = normalizeCategories(metadata);

  const frontmatter = matter.stringify(content, {
    ...metadata,
    category: categories[0] || metadata.category || '',
    categories: categories.length > 0 ? categories : [metadata.category],
    slug: cleanSlug,
  });

  const filePath = `content/posts/${cleanSlug}.mdx`;
  await commitFile(filePath, frontmatter, `Update post: ${cleanSlug}`);
}

// ✅ DELETE POST
export async function deletePost(slug: string) {
  const cleanSlug = slug.split('/').pop()!;

  const filePath = `content/posts/${cleanSlug}.mdx`;
  await deleteFile(filePath, `Delete post: ${cleanSlug}`);
}