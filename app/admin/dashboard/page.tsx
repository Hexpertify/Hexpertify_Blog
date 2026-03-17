'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { fetchAllPosts, deletePost, togglePublishPost } from '@/lib/actions';
import Image from 'next/image';
import { memo } from 'react';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string;
  published: boolean;
  date: string;
}

function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    startTransition(async () => {
      try {
        await deletePost(slug);
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    });
  };

  const togglePublish = async (slug: string) => {
    startTransition(async () => {
      try {
        await togglePublishPost(slug);
        loadPosts();
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
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="text-gray-600 mt-2">Manage your blog posts and content</p>
            </div>
            <Link href="/admin/posts/new">
              <Button
                className="flex items-center gap-2"
                style={{ backgroundColor: '#450BC8' }}
              >
                <Plus size={20} />
                New Post
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{posts.length}</CardTitle>
                <CardDescription>Total Posts</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {posts.filter(p => p.published).length}
                </CardTitle>
                <CardDescription>Published Posts</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {posts.filter(p => !p.published).length}
                </CardTitle>
                <CardDescription>Draft Posts</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>View and manage all your blog posts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No posts yet. Create your first post!
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          title={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {post.description}
                        </p>
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

export default memo(AdminDashboard);
