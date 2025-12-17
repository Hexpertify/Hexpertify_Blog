'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import MDXEditor from '@/components/admin/MDXEditor';
import { fetchPostBySlug, updatePost, fetchAllCategories } from '@/lib/actions';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface TOCItem {
  id: number;
  title: string;
  anchor: string;
}

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [originalSlug, setOriginalSlug] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    author: 'Cloud',
    authorBio: '',
    authorAvatar: '',
    authorConsultationUrl: '',
    authorTwitter: '',
    authorLinkedin: '',
    authorGithub: '',
    category: 'AI',
    imageUrl: '',
    readTime: '5 Minutes read',
    published: false,
  });
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    loadData();
  }, [params.slug]);

  const loadData = async () => {
    try {
      const [post, cats] = await Promise.all([
        fetchPostBySlug(params.slug),
        fetchAllCategories()
      ]);

      setCategories(cats.filter(cat => cat !== 'All'));

      if (!post) throw new Error('Post not found');

      setOriginalSlug(post.slug);
      const socialLinks = post.authorSocialLinks || {};
      const toc = post.tableOfContents || [];

      setFormData({
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        author: post.author,
        authorBio: post.authorBio || '',
        authorAvatar: post.authorAvatar || '',
        authorConsultationUrl: post.authorConsultationUrl || '',
        authorTwitter: socialLinks.twitter || '',
        authorLinkedin: socialLinks.linkedin || '',
        authorGithub: socialLinks.github || '',
        category: post.category,
        imageUrl: post.imageUrl,
        readTime: post.readTime,
        published: post.published,
      });

      setTocItems(toc);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch post');
    } finally {
      setFetching(false);
    }
  };


  const addTocItem = () => {
    const newId = tocItems.length > 0 ? Math.max(...tocItems.map(item => item.id)) + 1 : 1;
    setTocItems([...tocItems, { id: newId, title: '', anchor: '' }]);
  };

  const updateTocItem = (id: number, field: 'title' | 'anchor', value: string) => {
    setTocItems(tocItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeTocItem = (id: number) => {
    setTocItems(tocItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const metadata = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          author: formData.author,
          authorBio: formData.authorBio,
          authorAvatar: formData.authorAvatar,
          authorConsultationUrl: formData.authorConsultationUrl,
          authorSocialLinks: {
            twitter: formData.authorTwitter,
            linkedin: formData.authorLinkedin,
            github: formData.authorGithub,
          },
          category: formData.category,
          imageUrl: formData.imageUrl,
          readTime: formData.readTime,
          published: formData.published,
          date: new Date().toISOString(),
          tableOfContents: tocItems,
        };

        const result = await updatePost(originalSlug, metadata, formData.content);

        if (!result.success) {
          throw new Error(result.error || 'Failed to update post');
        }

        router.push('/admin/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to update post');
      }
    });
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <AdminNav />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Edit Post</CardTitle>
              <CardDescription>Update your blog post</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter post title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="post-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the post"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readTime">Read Time</Label>
                    <Input
                      id="readTime"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="5 Minutes read"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Author Details</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author Name *</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorBio">Author Bio</Label>
                      <Textarea
                        id="authorBio"
                        value={formData.authorBio}
                        onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                        placeholder="Brief bio about the author..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorAvatar">Author Avatar URL</Label>
                      <Input
                        id="authorAvatar"
                        value={formData.authorAvatar}
                        onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                        placeholder="https://images.pexels.com/..."
                      />
                      <p className="text-xs text-gray-500">
                        Image URL for author profile picture
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorConsultationUrl">Author Consultation URL</Label>
                      <Input
                        id="authorConsultationUrl"
                        value={formData.authorConsultationUrl}
                        onChange={(e) => setFormData({ ...formData, authorConsultationUrl: e.target.value })}
                        placeholder="https://calendly.com/..."
                      />
                      <p className="text-xs text-gray-500">
                        URL for booking consultations with the author
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="authorTwitter">Twitter URL</Label>
                        <Input
                          id="authorTwitter"
                          value={formData.authorTwitter}
                          onChange={(e) => setFormData({ ...formData, authorTwitter: e.target.value })}
                          placeholder="https://twitter.com/..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authorLinkedin">LinkedIn URL</Label>
                        <Input
                          id="authorLinkedin"
                          value={formData.authorLinkedin}
                          onChange={(e) => setFormData({ ...formData, authorLinkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authorGithub">GitHub URL</Label>
                        <Input
                          id="authorGithub"
                          value={formData.authorGithub}
                          onChange={(e) => setFormData({ ...formData, authorGithub: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Table of Contents</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTocItem}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {tocItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
                      No table of contents items yet. Click "Add Item" to create one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tocItems.map((item, index) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start border rounded-lg p-4">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor={`toc-title-${item.id}`}>
                                {index + 1}. Section Title
                              </Label>
                              <Input
                                id={`toc-title-${item.id}`}
                                value={item.title}
                                onChange={(e) => updateTocItem(item.id, 'title', e.target.value)}
                                placeholder="e.g., Introduction to Cloud Computing"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`toc-anchor-${item.id}`}>Anchor ID</Label>
                              <Input
                                id={`toc-anchor-${item.id}`}
                                value={item.anchor}
                                onChange={(e) => updateTocItem(item.id, 'anchor', e.target.value)}
                                placeholder="e.g., introduction-to-cloud"
                              />
                              <p className="text-xs text-gray-500">
                                Used for navigation links (optional)
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTocItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Featured Image URL *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.pexels.com/..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content (MDX) *</Label>
                  <MDXEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    Published
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    style={{ backgroundColor: '#450BC8' }}
                  >
                    {isPending ? 'Updating...' : 'Update Post'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
