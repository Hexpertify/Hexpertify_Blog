import fs from 'fs';
import path from 'path';
import { commitFile, getFileSha, deleteFile, getFileContent } from './github';

const categoriesFilePath = path.join(process.cwd(), 'content/categories.json');

export interface CategoriesData {
  categories: string[];
}

function ensureCategoriesFile() {
  // No longer creating file here, as writing is handled via GitHub API
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const fileContents = await getFileContent('content/categories.json');
    if (!fileContents) {
      return ['All', 'Mental Health', 'Fitness', 'Career', 'Cloud', 'Technology'];
    }
    const data: CategoriesData = JSON.parse(fileContents);
    return data.categories;
  } catch (error) {
    // If file not found or error, return default categories
    return ['All', 'Mental Health', 'Fitness', 'Career', 'Cloud', 'Technology'];
  }
}

export async function addCategory(category: string): Promise<{ success: boolean; error?: string }> {
  try {
    let data: CategoriesData;
    try {
      const fileContents = await getFileContent('content/categories.json');
      data = fileContents ? JSON.parse(fileContents) : { categories: ['All', 'Mental Health', 'Fitness', 'Career', 'Cloud', 'Technology'] };
    } catch {
      data = { categories: ['All', 'Mental Health', 'Fitness', 'Career', 'Cloud', 'Technology'] };
    }

    if (data.categories.includes(category)) {
      return { success: false, error: 'Category already exists' };
    }

    data.categories.push(category);
    const filePath = 'content/categories.json';
    await commitFile(filePath, JSON.stringify(data, null, 2), `Add category: ${category}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(category: string): Promise<{ success: boolean; error?: string }> {
  try {
    let data: CategoriesData;
    try {
      const fileContents = await getFileContent('content/categories.json');
      data = fileContents ? JSON.parse(fileContents) : { categories: ['All', 'Mental Health', 'Fitness', 'Career', 'Cloud', 'Technology'] };
    } catch {
      data = { categories: ['All', 'Mental Health', 'Fitness', 'Career', 'Cloud', 'Technology'] };
    }

    if (category === 'All') {
      return { success: false, error: 'Cannot delete "All" category' };
    }

    data.categories = data.categories.filter(c => c !== category);
    const filePath = 'content/categories.json';
    await commitFile(filePath, JSON.stringify(data, null, 2), `Delete category: ${category}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategories(categories: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const data: CategoriesData = { categories };
    const filePath = 'content/categories.json';
    await commitFile(filePath, JSON.stringify(data, null, 2), `Update categories`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
