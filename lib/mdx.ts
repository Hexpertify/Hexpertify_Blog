import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { commitFile, getFileSha, deleteFile, getFileContent, listDirectory } from './github';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  author: string;
  authorBio?: string;
  authorAvatar?: string;
  authorConsultationUrl?: string;
  authorSocialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  category: string;
  imageUrl: string;
  readTime: string;
  published: boolean;
  date: string;
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
          const fileSlug = fileName.replace(/\.mdx$/, '');
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
      .sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) {
          return 1;
        } else {
          return -1;
        }
      });
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
    const filePath = `content/posts/${slug}.mdx`;
    const fileContents = await getFileContent(filePath);
    if (!fileContents) return null;

    const { data, content } = matter(fileContents);

    return {
      ...(data as PostMetadata),
      slug,
      content,
    };
  } catch (error) {
    return null;
  }
}

export async function savePost(slug: string, metadata: PostMetadata, content: string) {
  const frontmatter = matter.stringify(content, {
    title: metadata.title,
    slug: metadata.slug,
    description: metadata.description,
    author: metadata.author,
    authorBio: metadata.authorBio || '',
    authorAvatar: metadata.authorAvatar || '',
    authorConsultationUrl: metadata.authorConsultationUrl || '',
    authorSocialLinks: metadata.authorSocialLinks || {},
    category: metadata.category,
    imageUrl: metadata.imageUrl,
    readTime: metadata.readTime,
    published: metadata.published,
    date: metadata.date,
    tableOfContents: metadata.tableOfContents || [],
  });

  const filePath = `content/posts/${slug}.mdx`;
  await commitFile(filePath, frontmatter, `Update post: ${slug}`);
}

export async function deletePost(slug: string) {
  const filePath = `content/posts/${slug}.mdx`;
  await deleteFile(filePath, `Delete post: ${slug}`);
}
