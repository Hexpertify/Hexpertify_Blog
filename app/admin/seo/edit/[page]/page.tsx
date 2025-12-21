'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { fetchSEOByPage, updateSEO, fetchDefaultSEO } from '@/lib/actions';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function EditSEOPage({ params }: { params: Promise<{ page: string }> }) {
  const resolvedParams = use(params) as { page: string };
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const ogImageInputRef = useRef<HTMLInputElement | null>(null);
  const twitterImageInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    keywords: '',
    canonicalUrl: '',
    robots: 'index, follow',
  });

  const handleOgImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (!data?.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setFormData(prev => ({ ...prev, ogImage: data.url as string }));
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image');
    } finally {
      if (ogImageInputRef.current) {
        ogImageInputRef.current.value = '';
      }
    }
  };

  const handleTwitterImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (!data?.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setFormData(prev => ({ ...prev, twitterImage: data.url as string }));
    } catch (error: any) {
      alert(error?.message || 'Failed to upload image');
    } finally {
      if (twitterImageInputRef.current) {
        twitterImageInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    loadSEO();
  }, [resolvedParams.page]);

  const loadSEO = async () => {
    try {
      let seo = await fetchSEOByPage(resolvedParams.page);

      if (!seo) {
        const defaultSEO = await fetchDefaultSEO();
        seo = {
          page: resolvedParams.page,
          ...defaultSEO,
        };
      }

      setFormData({
        title: seo.title,
        description: seo.description,
        ogTitle: seo.ogTitle || '',
        ogDescription: seo.ogDescription || '',
        ogImage: seo.ogImage || '',
        ogType: seo.ogType || 'website',
        twitterCard: seo.twitterCard || 'summary_large_image',
        twitterTitle: seo.twitterTitle || '',
        twitterDescription: seo.twitterDescription || '',
        twitterImage: seo.twitterImage || '',
        keywords: seo.keywords || '',
        canonicalUrl: seo.canonicalUrl || '',
        robots: seo.robots || 'index, follow',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch SEO');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const metadata = {
        title: formData.title,
        description: formData.description,
        ogTitle: formData.ogTitle || formData.title,
        ogDescription: formData.ogDescription || formData.description,
        ogImage: formData.ogImage,
        ogType: formData.ogType,
        twitterCard: formData.twitterCard,
        twitterTitle: formData.twitterTitle || formData.title,
        twitterDescription: formData.twitterDescription || formData.description,
        twitterImage: formData.twitterImage || formData.ogImage,
        keywords: formData.keywords,
        canonicalUrl: formData.canonicalUrl,
        robots: formData.robots,
        updatedAt: new Date().toISOString(),
      };

      const result = await updateSEO(resolvedParams.page, metadata);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update SEO');
      }

      router.push('/admin/seo');
    } catch (err: any) {
      setError(err.message || 'Failed to update SEO');
    } finally {
      setLoading(false);
    }
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
          <Link href="/admin/seo">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Back to SEO Management
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Edit SEO: {resolvedParams.page}</CardTitle>
              <CardDescription>Update SEO metadata for this page</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic SEO</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Meta Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Meta title shown in search results"
                        required
                      />
                      <p className="text-xs text-gray-500">50-60 characters recommended</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Meta Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="A brief description of this page for search engines"
                        rows={3}
                        required
                      />
                      <p className="text-xs text-gray-500">150-160 characters recommended</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                      <p className="text-xs text-gray-500">Comma-separated keywords</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Graph (Facebook, LinkedIn)</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogTitle">OG Title</Label>
                      <Input
                        id="ogTitle"
                        value={formData.ogTitle}
                        onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                        placeholder="Leave blank to use page title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogDescription">OG Description</Label>
                      <Textarea
                        id="ogDescription"
                        value={formData.ogDescription}
                        onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                        placeholder="Leave blank to use meta description"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogImage">OG Image</Label>
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <Input
                          id="ogImage"
                          value={formData.ogImage}
                          onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                          placeholder="Image URL or upload using the button"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={ogImageInputRef}
                          onChange={handleOgImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="whitespace-nowrap flex items-center gap-2"
                          onClick={() => ogImageInputRef.current?.click()}
                        >
                          <Upload size={16} />
                          Upload
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">1200x630px recommended</p>
                      {formData.ogImage && (
                        <div className="mt-3">
                          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={formData.ogImage}
                              alt="OG image preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogType">OG Type</Label>
                      <Input
                        id="ogType"
                        value={formData.ogType}
                        onChange={(e) => setFormData({ ...formData, ogType: e.target.value })}
                        placeholder="website"
                      />
                      <p className="text-xs text-gray-500">website, article, product, etc.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Twitter Card</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitterCard">Twitter Card Type</Label>
                      <Input
                        id="twitterCard"
                        value={formData.twitterCard}
                        onChange={(e) => setFormData({ ...formData, twitterCard: e.target.value })}
                        placeholder="summary_large_image"
                      />
                      <p className="text-xs text-gray-500">summary, summary_large_image, app, player</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitterTitle">Twitter Title</Label>
                      <Input
                        id="twitterTitle"
                        value={formData.twitterTitle}
                        onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
                        placeholder="Leave blank to use page title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitterDescription">Twitter Description</Label>
                      <Textarea
                        id="twitterDescription"
                        value={formData.twitterDescription}
                        onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
                        placeholder="Leave blank to use meta description"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitterImage">Twitter Image</Label>
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                        <Input
                          id="twitterImage"
                          value={formData.twitterImage}
                          onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
                          placeholder="Image URL or upload using the button (leave blank to use OG image)"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={twitterImageInputRef}
                          onChange={handleTwitterImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="whitespace-nowrap flex items-center gap-2"
                          onClick={() => twitterImageInputRef.current?.click()}
                        >
                          <Upload size={16} />
                          Upload
                        </Button>
                      </div>
                      {formData.twitterImage && (
                        <div className="mt-3">
                          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={formData.twitterImage}
                              alt="Twitter image preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="canonicalUrl">Canonical URL</Label>
                      <Input
                        id="canonicalUrl"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        placeholder="https://example.com/page"
                      />
                      <p className="text-xs text-gray-500">Optional: Specify the preferred URL for this page</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="robots">Robots Meta Tag</Label>
                      <Input
                        id="robots"
                        value={formData.robots}
                        onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                        placeholder="index, follow"
                      />
                      <p className="text-xs text-gray-500">index, follow / noindex, nofollow</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: '#450BC8' }}
                  >
                    {loading ? 'Updating...' : 'Update SEO'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/seo')}
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
