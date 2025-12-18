import type { Metadata } from 'next';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    authorConsultationUrl: post.authorConsultationUrl || '',
    authorSocialLinks: post.authorSocialLinks || {},
    tableOfContents: (post.tableOfContents || []) as TOCItem[],
    date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    readTime: post.readTime,
    imageUrl: post.imageUrl,
    category: post.category,
    content: post.content,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogData(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const seo = await SEOHead({
    page: `blog-${slug}`,
    fallbackTitle: `${blog.title} | Hexpertify Blog`,
    fallbackDescription: blog.description,
  });

  return {
    ...seo,
    alternates: {
      canonical: `https://hexpertify.com/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogData(slug);
  const faqs = await getFAQsByPage(slug);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BlogDetailHero blog={blog} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8 sm:py-12">
          <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
            <div className="hidden lg:block">
              <BlogAuthorCard
                author={blog.author}
                authorBio={blog.authorBio}
                authorAvatar={blog.authorAvatar}
                authorConsultationUrl={blog.authorConsultationUrl}
                socialLinks={blog.authorSocialLinks}
              />
            </div>
            <BlogSubscribe />
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            {blog.tableOfContents.length > 0 && (
              <div className="bg-purple-50/50 rounded-lg px-4 sm:px-9 py-4 sm:py-6 mb-6 sm:mb-8 max-w-xl mx-auto">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">Table of Contents</h3>
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

            <div className="lg:hidden mb-6 sm:mb-8 max-w-sm mx-auto">
              <BlogAuthorCard
                author={blog.author}
                authorBio={blog.authorBio}
                authorAvatar={blog.authorAvatar}
                authorConsultationUrl={blog.authorConsultationUrl}
                socialLinks={blog.authorSocialLinks}
              />
            </div>

            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed text-justify">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-justify">{children}</p>
                    ),
                    strong: ({ children }) => <strong>{children}</strong>,
                    em: ({ children }) => <em>{children}</em>,
                    img: ({ src, alt }) => (
                      <div className="my-6">
                        <Image
                          src={src || ''}
                          alt={alt || 'Blog image'}
                          width={800}
                          height={400}
                          className="rounded-lg w-full h-auto"
                          priority={false}
                        />
                      </div>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-purple-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {children}
                      </code>
                    ),
                    li: ({ children }) => (
                      <li className="ml-6">{children}</li>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4">{children}</ol>
                    ),
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
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
