import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { commitFile, getFileSha, deleteFile } from './github';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  author: string;
  authorBio?: string;
  authorAvatar?: string;
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

export function getAllPosts(): Post[] {
  try {
    ensurePostsDirectory();

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => {
        const fileSlug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          ...( data as PostMetadata),
          slug: fileSlug,
          content,
        };
      })
      .sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) {
          return 1;
        } else {
          return -1;
        }
      });

    return allPostsData;
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

export function getPublishedPosts(): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.published);
}

export function getPostBySlug(slug: string): Post | null {
  try {
    ensurePostsDirectory();

    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
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

export function savePost(slug: string, metadata: PostMetadata, content: string) {
  const frontmatter = matter.stringify(content, {
    title: metadata.title,
    slug: metadata.slug,
    description: metadata.description,
    author: metadata.author,
    authorBio: metadata.authorBio || '',
    authorAvatar: metadata.authorAvatar || '',
    authorSocialLinks: metadata.authorSocialLinks || {},
    category: metadata.category,
    imageUrl: metadata.imageUrl,
    readTime: metadata.readTime,
    published: metadata.published,
    date: metadata.date,
    tableOfContents: metadata.tableOfContents || [],
  });

  const filePath = `content/posts/${slug}.mdx`;
  commitFile(filePath, frontmatter, `Update post: ${slug}`);
}

export function deletePost(slug: string) {
  const filePath = `content/posts/${slug}.mdx`;
  deleteFile(filePath, `Delete post: ${slug}`);
}
