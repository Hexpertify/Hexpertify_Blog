import type { Metadata } from 'next';
import Header from '@/components/blog/Header';
import BlogDetailHero from '@/components/blog/BlogDetailHero';
import BlogAuthorCard from '@/components/blog/BlogAuthorCard';
import BlogSubscribe from '@/components/blog/BlogSubscribe';
import FAQSection from '@/components/FAQSection';
import { getPostBySlug } from '@/lib/mdx';
import { getFAQsByPage } from '@/lib/faqs';
import SEOHead from '@/components/SEOHead';

interface TOCItem {
  id: number;
  title: string;
  anchor: string;
}

async function getBlogData(slug: string) {
  const post = await getPostBySlug(slug);

  if (!post || !post.published) return null;

  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    authorBio: post.authorBio || '',
    authorAvatar: post.authorAvatar || '',
    authorSocialLinks: post.authorSocialLinks || {},
    tableOfContents: (post.tableOfContents || []) as TOCItem[],
    date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    readTime: post.readTime,
    imageUrl: post.imageUrl,
    category: post.category,
    content: post.content,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlogData(params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return await SEOHead({
    page: `blog-${params.slug}`,
    fallbackTitle: `${blog.title} | Hexpertify Blog`,
    fallbackDescription: blog.description,
  });
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogData(params.slug);
  const faqs = await getFAQsByPage(params.slug);

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">Blog not found</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogDetailHero blog={blog} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-12">
          <div className="space-y-6">
            <BlogAuthorCard
              author={blog.author}
              authorBio={blog.authorBio}
              authorAvatar={blog.authorAvatar}
              socialLinks={blog.authorSocialLinks}
            />
            <BlogSubscribe />
          </div>

          <div className="lg:col-span-3">
            {blog.tableOfContents.length > 0 && (
              <div className="bg-purple-50/50 rounded-lg px-9 py-6 mb-8 max-w-xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Table of Contents</h3>
                <ol className="space-y-2">
                  {blog.tableOfContents.map((item, index) => (
                    <li key={item.id} className="text-sm leading-relaxed">
                      <a
                        href={item.anchor ? `#${item.anchor}` : '#'}
                        className="text-gray-700 hover:text-purple-600 transition-colors font-semibold"
                      >
                        <span className="font-semibold">{index + 1}.</span> {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="prose max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: blog.content
                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-6 w-full" />')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-purple-600 hover:underline">$1</a>')
                    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')
                    .replace(/^- (.*$)/gim, '<li class="ml-6">$1</li>')
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/^(.)/g, '<p class="mb-4">$1')
                    .replace(/(.)\n/g, '$1</p>')
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <FAQSection faqs={faqs} />
        </div>
      </main>
    </div>
  );
}
