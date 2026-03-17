'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { fetchAllPosts, deletePost, togglePublishPost, fetchAllCategories } from '@/lib/actions';
import Image from 'next/image';
import { memo } from 'react';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string;
  imageAlt?: string;
  published: boolean;
  date: string;
}

function AllPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = useCallback(async () => {
    try {
      const [postsData, catsData] = await Promise.all([
        fetchAllPosts(),
        fetchAllCategories()
      ]);
      setPosts(postsData);
      setCategories(catsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPosts = useCallback(() => {
    let filtered = [...posts];

    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((post) => post.category === categoryFilter);
    }

    if (statusFilter !== 'All') {
      const isPublished = statusFilter === 'Published';
      filtered = filtered.filter((post) => post.published === isPublished);
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterPosts();
  }, [filterPosts]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    startTransition(async () => {
      try {
        await deletePost(slug);
        loadData();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    });
  };

  const togglePublish = async (slug: string) => {
    startTransition(async () => {
      try {
        await togglePublishPost(slug);
        loadData();
      } catch (error) {
        console.error('Error updating post:', error);
      }
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
              <p className="text-gray-600 mt-2">
                {filteredPosts.length} of {posts.length} posts
              </p>
            </div>
            <Link href="/admin/posts/new">
              <Button className="flex items-center gap-2" style={{ backgroundColor: '#450BC8' }}>
                <Plus size={20} />
                New Post
              </Button>
            </Link>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'All' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage all your blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No posts found</div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <Image src={post.imageUrl} alt={post.imageAlt || post.title} title={post.title} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{post.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{post.category}</span>
                          <span>•</span>
                          <span>{post.author}</span>
                          <span>•</span>
                          <span className={post.published ? 'text-green-600' : 'text-orange-600'}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePublish(post.slug)}
                          title={post.published ? 'Unpublish' : 'Publish'}
                          disabled={isPending}
                        >
                          <Eye size={16} />
                        </Button>
                        <Link href={`/admin/posts/edit/${post.slug}`}>
                          <Button variant="outline" size="sm" disabled={isPending}>
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.slug)}
                          disabled={isPending}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default memo(AllPostsPage);
