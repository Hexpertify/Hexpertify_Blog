'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import Link from 'next/link';
import { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';

function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Failed to parse JSON from /api/categories:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (data && data.success) {
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } else {
        console.error('Error loading categories:', data?.error);
        setError(data?.error || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError((error as any)?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryName: newCategory.trim() }),
      });
      const text = await response.text();
      if (!text) throw new Error('Empty response from server');
      let result: any;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error('Failed to parse JSON from POST /api/categories:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (result.success) {
        setSuccess('Category added successfully!');
        setNewCategory('');
        await loadCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to add category');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!confirm(`Are you sure you want to delete the "${category}" category?`)) return;

    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryName: category }),
      });
      const text = await response.text();
      if (!text) throw new Error('Empty response from server');
      let result: any;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error('Failed to parse JSON from DELETE /api/categories:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (result.success) {
        setSuccess('Category deleted successfully!');
        await loadCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardContent className="space-y-6">
              <Tabs defaultValue="manage" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manage">Manage Categories</TabsTrigger>
                  <TabsTrigger value="guide">Categories Guide</TabsTrigger>
                </TabsList>
                <TabsContent value="manage" className="space-y-6">
                  <div>
                    <CardTitle className="text-xl mb-2">Manage Categories</CardTitle>
                    <CardDescription>
                      Add or remove blog post categories. The "All" category cannot be deleted.
                    </CardDescription>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-500 text-green-700 bg-green-50">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleAddCategory} className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Enter new category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      disabled={actionLoading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={actionLoading || !newCategory.trim()}
                      style={{ backgroundColor: '#450BC8' }}
                      className="flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add Category
                    </Button>
                  </form>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Current Categories ({categories.length})
                    </h3>

                    {loading ? (
                      <div className="text-center py-8">Loading categories...</div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No categories found
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <div
                            key={category}
                            className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">{category}</span>
                            {category !== 'All' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCategory(category)}
                                disabled={actionLoading}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                            {category === 'All' && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="guide" className="space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {`# Categories Management Guide

## Overview

The categories system allows you to organize blog posts into different categories for better navigation and filtering. Categories help users find content relevant to their interests and improve the overall user experience of the blog.

## Storage and Management

Categories are stored in the Supabase database and managed through this admin interface. Each category is a simple string that can be assigned to blog posts.

## Admin Panel Usage

### Accessing Categories Management

1. Login to the admin panel at \`/admin/login\`
2. Navigate to "Categories" from the admin navigation menu
3. Use the "Manage Categories" tab to add or remove categories

### Adding a New Category

1. Enter the category name in the input field (e.g., "Technology", "Health", "Finance")
2. Click the "Add Category" button
3. The category will appear in the list immediately

### Deleting a Category

1. Find the category you want to remove
2. Click the trash icon next to it
3. Confirm the deletion in the popup dialog
4. Note: The "All" category cannot be deleted as it's the default category

## Best Practices

### Category Naming
- Use clear, descriptive names that users will understand
- Keep names concise but meaningful
- Use title case for consistency (e.g., "Artificial Intelligence" not "artificial intelligence")
- Avoid special characters or symbols

### Organization
- Create categories based on your content themes
- Don't create too many categories (aim for 5-15 total)
- Regularly review and consolidate similar categories
- Consider user search behavior when naming categories

### Content Assignment
- Assign each blog post to at least one relevant category
- Use multiple categories if a post fits multiple themes
- The "All" category is automatically applied to all posts

## Troubleshooting

### Category Not Appearing
- Check if the category name already exists (case-sensitive)
- Ensure the name doesn't contain leading/trailing spaces
- Refresh the page if changes don't appear immediately

### Cannot Delete Category
- The "All" category is protected and cannot be deleted
- Categories currently assigned to posts may have restrictions (check post assignments first)

### Performance Considerations
- Too many categories can make filtering complex for users
- Regularly archive unused categories to keep the list manageable`}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default memo(CategoriesPage);
