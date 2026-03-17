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
  authorSocialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  category: string;
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

export function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const fileNames = await listDirectory('content/posts');

    const allPostsData = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map(async (fileName) => {

          // ✅ FIX: extract clean slug from file name
          const fileSlug = fileName
            .split('/')
            .pop()!
            .replace(/\.mdx$/, '');

          const filePath = `content/posts/${fileName}`;
          const fileContents = await getFileContent(filePath);
          if (!fileContents) return null;

          const { data, content } = matter(fileContents);

          return {
            ...(data as PostMetadata),
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

export async function getPublishedPosts(): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.published);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // ✅ ensure clean slug
    const cleanSlug = slug.split('/').pop()!;

    const filePath = `content/posts/${cleanSlug}.mdx`;
    const fileContents = await getFileContent(filePath);
    if (!fileContents) return null;

    const { data, content } = matter(fileContents);

    return {
      ...(data as PostMetadata),
      slug: cleanSlug,
      content,
    };
  } catch (error) {
    return null;
  }
}

export async function savePost(slug: string, metadata: PostMetadata, content: string) {
  const cleanSlug = slug.split('/').pop()!;

  const frontmatter = matter.stringify(content, {
    ...metadata,
    slug: cleanSlug,
  });

  const filePath = `content/posts/${cleanSlug}.mdx`;
  await commitFile(filePath, frontmatter, `Update post: ${cleanSlug}`);
}

export async function deletePost(slug: string) {
  const cleanSlug = slug.split('/').pop()!;

  const filePath = `content/posts/${cleanSlug}.mdx`;
  await deleteFile(filePath, `Delete post: ${cleanSlug}`);
}