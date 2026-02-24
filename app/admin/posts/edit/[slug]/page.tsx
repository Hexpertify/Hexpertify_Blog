'use client';

import { useState, useEffect, useTransition, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import MDXEditor from '@/components/admin/MDXEditor';
import { fetchPostBySlug, updatePost, fetchAllCategories, fetchSEOByPage, updateSEO, createSEO } from '@/lib/actions';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';

interface TOCItem {
  id: number;
  title: string;
  anchor: string;
}

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params) as { slug: string };
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const featuredImageInputRef = useRef<HTMLInputElement | null>(null);
  const authorAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const seoOgImageInputRef = useRef<HTMLInputElement | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    author: 'Cloud',
    authorDesignation: '',
    authorBio: '',
    authorAvatar: '',
    authorAvatarAlt: '',
    authorConsultationUrl: '',
    authorTwitter: '',
    authorLinkedin: '',
    authorGithub: '',
    category: 'AI',
    imageUrl: '',
    imageAlt: '',
    readTime: '5 Minutes read',
    published: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoOgImage: '',
    seoOgImageAlt: '',
    seoOgTitle: '',
    seoOgDescription: '',
    seoTwitterTitle: '',
    seoTwitterDescription: '',
  });
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    loadData();
  }, [resolvedParams.slug]);

  const loadData = async () => {
    try {
      const [post, cats] = await Promise.all([
        fetchPostBySlug(resolvedParams.slug),
        fetchAllCategories(),
      ]);

      setCategories(cats.filter(cat => cat !== 'All'));

      if (!post) throw new Error('Post not found');

      setOriginalSlug(post.slug);
      const socialLinks = post.authorSocialLinks || {};
      const toc = post.tableOfContents || [];

      // Load existing SEO metadata for this blog post, if any
      let seo: any = null;
      try {
        seo = await fetchSEOByPage(`blog-${post.slug}`);
      } catch {
        seo = null;
      }

      setFormData({
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        author: post.author,
        authorDesignation: post.authorDesignation || '',
        authorBio: post.authorBio || '',
        authorAvatar: post.authorAvatar || '',
        authorAvatarAlt: post.authorAvatarAlt || '',
        authorConsultationUrl: post.authorConsultationUrl || '',
        authorTwitter: socialLinks.twitter || '',
        authorLinkedin: socialLinks.linkedin || '',
        authorGithub: socialLinks.github || '',
        category: post.category,
        imageUrl: post.imageUrl,
        imageAlt: post.imageAlt || '',
        readTime: post.readTime,
        published: post.published,
        seoTitle: seo?.title || '',
        seoDescription: seo?.description || '',
        seoKeywords: seo?.keywords || '',
        seoOgImage: seo?.ogImage || '',
        seoOgImageAlt: seo?.ogImageAlt || post.seoOgImageAlt || '',
        seoOgTitle: seo?.ogTitle || '',
        seoOgDescription: seo?.ogDescription || '',
        seoTwitterTitle: seo?.twitterTitle || '',
        seoTwitterDescription: seo?.twitterDescription || '',
      });

      setTocItems(toc);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch post');
    } finally {
      setFetching(false);
    }
  };
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addTocItem = () => {
    const newId = tocItems.length > 0 ? Math.max(...tocItems.map(item => item.id)) + 1 : 1;
    setTocItems([...tocItems, { id: newId, title: '', anchor: '' }]);
  };

  const updateTocItem = (id: number, field: 'title' | 'anchor', value: string) => {
    setTocItems(
      tocItems.map((item) => {
        if (item.id !== id) return item;

        const updated: TOCItem = { ...item, [field]: value };

        // Auto-generate anchor from title when it's empty and title changes
        if (field === 'title' && !item.anchor.trim() && value.trim()) {
          updated.anchor = generateSlug(value);
        }

        return updated;
      })
    );
  };

  const removeTocItem = (id: number) => {
    setTocItems(tocItems.filter(item => item.id !== id));
  };

  // basePath helper for client requests
  const getApiUrl = (path: string) => {
    const bp = typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.basePath || '' : '';
    return `${bp}${path}`;
  };

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error('Invalid JSON response from upload API: ' + text);
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (!data?.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setFormData(prev => ({ ...prev, imageUrl: data.url as string }));
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image');
    } finally {
      if (featuredImageInputRef.current) {
        featuredImageInputRef.current.value = '';
      }
    }
  };

  const handleAuthorAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error('Invalid JSON response from upload API: ' + text);
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (!data?.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setFormData(prev => ({ ...prev, authorAvatar: data.url as string }));
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image');
    } finally {
      if (authorAvatarInputRef.current) {
        authorAvatarInputRef.current.value = '';
      }
    }
  };

  const handleSeoOgImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error('Invalid JSON response from upload API: ' + text);
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (!data?.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setFormData(prev => ({ ...prev, seoOgImage: data.url as string }));
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image');
    } finally {
      if (seoOgImageInputRef.current) {
        seoOgImageInputRef.current.value = '';
      }
    }
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
          authorDesignation: formData.authorDesignation,
          authorBio: formData.authorBio,
          authorAvatar: formData.authorAvatar,
          authorAvatarAlt: formData.authorAvatarAlt,
          authorConsultationUrl: formData.authorConsultationUrl,
          authorSocialLinks: {
            twitter: formData.authorTwitter,
            linkedin: formData.authorLinkedin,
            github: formData.authorGithub,
          },
          category: formData.category,
          imageUrl: formData.imageUrl,
          imageAlt: formData.imageAlt,
          readTime: formData.readTime,
          published: formData.published,
          date: new Date().toISOString(),
          seoOgImageAlt: formData.seoOgImageAlt,
          tableOfContents: tocItems,
        };

        const result = await updatePost(originalSlug, metadata, formData.content);

        if (!result.success) {
          throw new Error(result.error || 'Failed to update post');
        }

        // Create or update SEO metadata for this blog post (blog-{slug})
        try {
          const seoMetadata = {
            title: formData.seoTitle || formData.title,
            description: formData.seoDescription || formData.description,
            ogTitle: formData.seoOgTitle || formData.seoTitle || formData.title,
            ogDescription:
              formData.seoOgDescription || formData.seoDescription || formData.description,
            ogImage: formData.seoOgImage || formData.imageUrl,
            ogImageAlt: formData.seoOgImageAlt || '',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            twitterTitle:
              formData.seoTwitterTitle ||
              formData.seoOgTitle ||
              formData.seoTitle ||
              formData.title,
            twitterDescription:
              formData.seoTwitterDescription ||
              formData.seoOgDescription ||
              formData.seoDescription ||
              formData.description,
            twitterImage: '',
            twitterImageAlt: '',
            keywords: formData.seoKeywords || '',
            canonicalUrl: '',
            robots: 'index, follow',
            updatedAt: new Date().toISOString(),
          };

          // updateSEO will write or overwrite SEO for this page
          await updateSEO(`blog-${metadata.slug}`, seoMetadata);
        } catch (seoError) {
          console.error('Error updating SEO for post:', seoError);
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

                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
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
                          <Label htmlFor="authorDesignation">Author Designation</Label>
                          <Input
                            id="authorDesignation"
                            value={formData.authorDesignation}
                            onChange={(e) => setFormData({ ...formData, authorDesignation: e.target.value })}
                            placeholder="AI Expert"
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
                          <Label htmlFor="authorAvatar">Author Avatar</Label>
                          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <Input
                              id="authorAvatar"
                              value={formData.authorAvatar}
                              onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                              placeholder="Image URL or upload using the button"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              ref={authorAvatarInputRef}
                              onChange={handleAuthorAvatarUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="whitespace-nowrap flex items-center gap-2"
                              onClick={() => authorAvatarInputRef.current?.click()}
                            >
                              <Upload size={16} />
                              Upload
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="authorAvatarAlt">Author Avatar Alt Text</Label>
                            <Input
                              id="authorAvatarAlt"
                              value={formData.authorAvatarAlt}
                              onChange={(e) => setFormData({ ...formData, authorAvatarAlt: e.target.value })}
                              placeholder="Describe the author avatar image"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            You can paste an existing image URL or upload directly from your computer.
                          </p>
                          {formData.authorAvatar && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                <Image
                                  src={formData.authorAvatar}
                                  alt={formData.authorAvatarAlt || formData.author || 'Author avatar preview'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
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

                    <div className="space-y-2 border-t pt-6">
                      <Label htmlFor="imageUrl">Featured Image *</Label>
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="Image URL or upload using the button"
                          required
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={featuredImageInputRef}
                          onChange={handleFeaturedImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="whitespace-nowrap flex items-center gap-2"
                          onClick={() => featuredImageInputRef.current?.click()}
                        >
                          <Upload size={16} />
                          Upload
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageAlt">Featured Image Alt Text</Label>
                        <Input
                          id="imageAlt"
                          value={formData.imageAlt}
                          onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                          placeholder="Describe the featured image"
                        />
                      </div>
                      {formData.imageUrl && (
                        <div className="mt-3">
                          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={formData.imageUrl}
                              alt={formData.imageAlt || formData.title || 'Featured image preview'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 border-t pt-6">
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                      />
                      <Label htmlFor="published" className="cursor-pointer">
                        Published
                      </Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-6">
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

                    <div className="space-y-2 border-t pt-6">
                      <Label htmlFor="content">Content (MDX) *</Label>
                      <MDXEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-6">
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
                      <p className="text-xs text-gray-600">
                        Configure how this post appears in search results and social previews.
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="seoTitle">SEO Title</Label>
                        <Input
                          id="seoTitle"
                          value={formData.seoTitle}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                          placeholder="Defaults to post title if left empty"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seoDescription">SEO Description</Label>
                        <Textarea
                          id="seoDescription"
                          value={formData.seoDescription}
                          onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                          placeholder="Defaults to post description if left empty"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seoKeywords">SEO Keywords</Label>
                        <Input
                          id="seoKeywords"
                          value={formData.seoKeywords}
                          onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                          placeholder="e.g., cloud computing, beginner guide, hexpertify"
                        />
                        <p className="text-xs text-gray-500">
                          Optional: comma-separated list of keywords.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seoOgImage">Social Share Image</Label>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <Input
                            id="seoOgImage"
                            value={formData.seoOgImage}
                            onChange={(e) => setFormData({ ...formData, seoOgImage: e.target.value })}
                            placeholder="Image URL or upload using the button (defaults to featured image if empty)"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            ref={seoOgImageInputRef}
                            onChange={handleSeoOgImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="whitespace-nowrap flex items-center gap-2"
                            onClick={() => seoOgImageInputRef.current?.click()}
                          >
                            <Upload size={16} />
                            Upload
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoOgImageAlt">Social Share Image Alt Text</Label>
                          <Input
                            id="seoOgImageAlt"
                            value={formData.seoOgImageAlt}
                            onChange={(e) => setFormData({ ...formData, seoOgImageAlt: e.target.value })}
                            placeholder="Describe the social share image"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Recommended: 1200x630 image used for social previews.
                        </p>
                        {(formData.seoOgImage || formData.imageUrl) && (
                          <div className="mt-3">
                            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={formData.seoOgImage || formData.imageUrl}
                                alt={
                                  formData.seoOgImageAlt ||
                                  formData.seoOgTitle ||
                                  formData.seoTitle ||
                                  formData.title ||
                                  'Social share image preview'
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Open Graph (Facebook, LinkedIn)</h4>

                        <div className="space-y-2">
                          <Label htmlFor="seoOgTitle">OG Title</Label>
                          <Input
                            id="seoOgTitle"
                            value={formData.seoOgTitle}
                            onChange={(e) => setFormData({ ...formData, seoOgTitle: e.target.value })}
                            placeholder="Defaults to SEO Title if left empty"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoOgDescription">OG Description</Label>
                          <Textarea
                            id="seoOgDescription"
                            value={formData.seoOgDescription}
                            onChange={(e) => setFormData({ ...formData, seoOgDescription: e.target.value })}
                            placeholder="Defaults to SEO Description if left empty"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Twitter</h4>

                        <div className="space-y-2">
                          <Label htmlFor="seoTwitterTitle">Twitter Title</Label>
                          <Input
                            id="seoTwitterTitle"
                            value={formData.seoTwitterTitle}
                            onChange={(e) => setFormData({ ...formData, seoTwitterTitle: e.target.value })}
                            placeholder="Defaults to OG / SEO Title if left empty"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoTwitterDescription">Twitter Description</Label>
                          <Textarea
                            id="seoTwitterDescription"
                            value={formData.seoTwitterDescription}
                            onChange={(e) => setFormData({ ...formData, seoTwitterDescription: e.target.value })}
                            placeholder="Defaults to OG / SEO Description if left empty"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

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
