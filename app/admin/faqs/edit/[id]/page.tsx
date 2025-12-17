'use client';

import { useState, useEffect, useTransition, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNav from '@/components/admin/AdminNav';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { fetchFAQById, updateFAQ, fetchAllPosts } from '@/lib/actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditFAQPage({ params }: any) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [blogSlugs, setBlogSlugs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    published: false,
    relatedTo: 'homepage',
  });

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    try {
      const [faq, posts] = await Promise.all([
        fetchFAQById(resolvedParams.id),
        fetchAllPosts()
      ]);

      setBlogSlugs(posts.map(post => post.slug));

      if (!faq) throw new Error('FAQ not found');

      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        published: faq.published,
        relatedTo: faq.relatedTo,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch FAQ');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const metadata = {
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          order: formData.order,
          published: formData.published,
          createdAt: new Date().toISOString(),
          relatedTo: formData.relatedTo,
        };

        const result = await updateFAQ(resolvedParams.id, metadata);

        if (!result.success) {
          throw new Error(result.error || 'Failed to update FAQ');
        }

        router.push('/admin/faqs');
      } catch (err: any) {
        setError(err.message || 'Failed to update FAQ');
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/faqs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Back to FAQs
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Edit FAQ</CardTitle>
              <CardDescription>Update the frequently asked question</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Answer *</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Enter the answer"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., General, Booking, Pricing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relatedTo">Related To *</Label>
                    <Select
                      value={formData.relatedTo}
                      onValueChange={(value) => setFormData({ ...formData, relatedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage">Homepage</SelectItem>
                        {blogSlugs.length > 0 && (
                          <>
                            <SelectItem value="__divider__" disabled className="text-xs font-semibold text-gray-500">
                              Blog Posts
                            </SelectItem>
                            {blogSlugs.map((slug) => (
                              <SelectItem key={slug} value={slug}>
                                {slug}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Choose where this FAQ should appear (homepage or specific blog post)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    Publish immediately
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    style={{ backgroundColor: '#450BC8' }}
                  >
                    {isPending ? 'Updating...' : 'Update FAQ'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/faqs')}
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
