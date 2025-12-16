'use server';

import { getAllPosts, getPostBySlug, savePost, deletePost as deleteMdxPost, PostMetadata } from './mdx';
import { getAllCategories, addCategory as addCategoryToFile, deleteCategory as deleteCategoryFromFile } from './categories';
import { getAllFAQs, getFAQById, getFAQsByPage, saveFAQ, deleteFAQ as deleteFAQFile, FAQMetadata } from './faqs';
import { getAllSEOPages, getSEOByPage, saveSEO, deleteSEO as deleteSEOFile, SEOMetadata, getDefaultSEO } from './seo';
import { triggerRebuild } from './github';
import { revalidatePath } from 'next/cache';

function safeRevalidate(path: string, type?: string) {
  try {
    revalidatePath(path, type as any);
  } catch {
    // Silently handle revalidation errors in static context
  }
}

export async function fetchAllPosts() {
  return await getAllPosts();
}

export async function fetchPostBySlug(slug: string) {
  return await getPostBySlug(slug);
}

export async function createPost(metadata: PostMetadata, content: string) {
  try {
    await savePost(metadata.slug, metadata, content);
    safeRevalidate('/');
    safeRevalidate('/blog/[slug]', 'page');
    safeRevalidate('/admin/dashboard');
    safeRevalidate('/admin/posts');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePost(slug: string, metadata: PostMetadata, content: string) {
  try {
    await savePost(slug, metadata, content);
    safeRevalidate('/');
    safeRevalidate(`/blog/${slug}`);
    safeRevalidate('/admin/dashboard');
    safeRevalidate('/admin/posts');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePost(slug: string) {
  try {
    await deleteMdxPost(slug);
    safeRevalidate('/');
    safeRevalidate('/admin/dashboard');
    safeRevalidate('/admin/posts');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function togglePublishPost(slug: string) {
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const metadata: PostMetadata = {
      title: post.title,
      slug: post.slug,
      description: post.description,
      author: post.author,
      authorBio: post.authorBio,
      authorAvatar: post.authorAvatar,
      authorSocialLinks: post.authorSocialLinks,
      category: post.category,
      imageUrl: post.imageUrl,
      readTime: post.readTime,
      published: !post.published,
      date: post.date,
      tableOfContents: post.tableOfContents,
    };

    await savePost(slug, metadata, post.content);
    safeRevalidate('/');
    safeRevalidate(`/blog/${slug}`);
    safeRevalidate('/admin/dashboard');
    safeRevalidate('/admin/posts');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchAllCategories() {
  return await getAllCategories();
}

export async function createCategory(categoryName: string) {
  try {
    const result = await addCategoryToFile(categoryName);
    if (result.success) {
      safeRevalidate('/');
      safeRevalidate('/admin/dashboard');
      safeRevalidate('/admin/posts');
      safeRevalidate('/admin/categories');
      await triggerRebuild();
    }
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeCategoryAction(categoryName: string) {
  try {
    const result = await deleteCategoryFromFile(categoryName);
    if (result.success) {
      safeRevalidate('/');
      safeRevalidate('/admin/dashboard');
      safeRevalidate('/admin/posts');
      safeRevalidate('/admin/categories');
      await triggerRebuild();
    }
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchAllFAQs() {
  return await getAllFAQs();
}

export async function fetchFAQById(id: string) {
  return await getFAQById(id);
}

export async function fetchFAQsByPage(pageName: string) {
  return await getFAQsByPage(pageName);
}

export async function createFAQ(id: string, metadata: Omit<FAQMetadata, 'id'>) {
  try {
    await saveFAQ(id, metadata);
    safeRevalidate('/');
    safeRevalidate('/blog/[slug]', 'page');
    safeRevalidate('/admin/faqs');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFAQ(id: string, metadata: Omit<FAQMetadata, 'id'>) {
  try {
    await saveFAQ(id, metadata);
    safeRevalidate('/');
    safeRevalidate('/blog/[slug]', 'page');
    safeRevalidate('/admin/faqs');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFAQ(id: string) {
  try {
    await deleteFAQFile(id);
    safeRevalidate('/');
    safeRevalidate('/blog/[slug]', 'page');
    safeRevalidate('/admin/faqs');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function togglePublishFAQ(id: string) {
  try {
    const faq = await getFAQById(id);
    if (!faq) {
      return { success: false, error: 'FAQ not found' };
    }

    const metadata: Omit<FAQMetadata, 'id'> = {
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      published: !faq.published,
      order: faq.order,
      createdAt: faq.createdAt,
      relatedTo: faq.relatedTo,
    };

    await saveFAQ(id, metadata);
    safeRevalidate('/');
    safeRevalidate('/blog/[slug]', 'page');
    safeRevalidate('/admin/faqs');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchAllSEO() {
  return await getAllSEOPages();
}

export async function fetchSEOByPage(page: string) {
  return await getSEOByPage(page);
}

export async function fetchDefaultSEO() {
  return getDefaultSEO();
}

export async function createSEO(page: string, metadata: Omit<SEOMetadata, 'page'>) {
  try {
    await saveSEO(page, metadata);
    safeRevalidate('/');
    safeRevalidate(`/${page}`);
    safeRevalidate('/admin/seo');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSEO(page: string, metadata: Omit<SEOMetadata, 'page'>) {
  try {
    saveSEO(page, metadata);
    safeRevalidate('/');
    safeRevalidate(`/${page}`);
    safeRevalidate('/admin/seo');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSEO(page: string) {
  try {
    await deleteSEOFile(page);
    safeRevalidate('/');
    safeRevalidate('/admin/seo');
    await triggerRebuild();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
