import type { Metadata } from 'next';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from '@/components/blog/Header';
import BlogDetailHero from '@/components/blog/BlogDetailHero';
import BlogAuthorCard from '@/components/blog/BlogAuthorCard';
import BlogSubscribe from '@/components/blog/BlogSubscribe';
import RelatedPostsSidebar from '@/components/blog/RelatedPostsSidebar';
import FAQSection from '@/components/FAQSection';
import { getPostBySlug, getPublishedPosts } from '@/lib/mdx';
import { getFAQsByPage } from '@/lib/faqs';
import SEOHead from '@/components/SEOHead';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogs.hexpertify.com';

interface TOCItem {
  id: number;
  title: string;
  anchor: string;
}

async function getBlogData(slug: string) {
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ]);

  if (!post || !post.published) return null;

  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.published && p.category === post.category)
    .slice(0, 5)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      imageUrl: p.imageUrl,
      author: p.author,
      authorDesignation: p.authorDesignation || '',
    }));

  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    authorDesignation: post.authorDesignation || '',
    authorBio: post.authorBio || '',
    authorAvatar: post.authorAvatar || '',
    authorConsultationUrl: post.authorConsultationUrl || '',
    authorSocialLinks: post.authorSocialLinks || {},
    tableOfContents: (post.tableOfContents || []) as TOCItem[],
    date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    rawDate: post.date,
    readTime: post.readTime,
    imageUrl: post.imageUrl,
    category: post.category,
    content: post.content,
    relatedPosts,
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
      canonical: `${SITE_URL}/blog/${slug}`,
    },
  };
}

import Schema from '@/components/Schema';

function buildBlogGraphSchema(blog: any, faqs: any[]) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogs.hexpertify.com';
  const MAIN_SITE_URL = 'https://hexpertify.com';

  const blogUrl = `${SITE_URL}/blog/${blog.slug}`;
  const authorSlug = blog.author
    ? String(blog.author)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : 'jaswanth';

  const imageUrl = blog.imageUrl
    ? blog.imageUrl.startsWith('http')
      ? blog.imageUrl
      : `${SITE_URL}${blog.imageUrl.startsWith('/') ? '' : '/'}${blog.imageUrl}`
    : undefined;

  const rawDate = blog.rawDate ? new Date(blog.rawDate) : null;
  const dateString = rawDate && !Number.isNaN(rawDate.getTime()) ? rawDate.toISOString().slice(0, 10) : undefined;

  const organizationId = 'https://hexpertify.com/#organization';
  const personId = `${MAIN_SITE_URL}/experts/${authorSlug}#person`;
  const blogId = `${SITE_URL}/#blog`;

  const fallbackFaqs = [
    {
      question: 'What is Hexpertify?',
      answer:
        'Hexpertify is an online consulting platform that connects users with certified and verified professionals across multiple domains such as healthcare, finance, career, fitness, and mental health.',
    },
    {
      question: 'Who writes blogs on Hexpertify?',
      answer: 'All blogs on Hexpertify are written by certified and verified experts to ensure accuracy, trust, and credibility.',
    },
    {
      question: 'Can I consult experts on Hexpertify?',
      answer: 'Yes, users can consult experts on Hexpertify through text, call, or video consultations.',
    },
    {
      question: 'What fields does Hexpertify cover?',
      answer:
        'Hexpertify covers a wide range of fields including healthcare, mental health counseling, finance, business consulting, career counseling, fashion consulting, and fitness coaching.',
    },
  ];

  const faqItems = (faqs && faqs.length ? faqs : fallbackFaqs).map((faq: any) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Hexpertify',
        url: MAIN_SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${MAIN_SITE_URL}/logo.png`,
        },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: blog.author || 'Jaswanth',
        jobTitle: blog.authorDesignation || 'Founder',
        description:
          blog.authorBio || 'Founder of Hexpertify and an advocate for expert-driven, verified online guidance.',
        worksFor: {
          '@id': organizationId,
        },
      },
      {
        '@type': 'BlogPosting',
        '@id': `${blogUrl}#blogposting`,
        headline: blog.title,
        description: blog.description,
        image: imageUrl,
        datePublished: dateString,
        dateModified: dateString,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': blogUrl,
        },
        author: {
          '@id': personId,
        },
        publisher: {
          '@id': organizationId,
        },
        isPartOf: {
          '@id': blogId,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${blogUrl}#faq`,
        mainEntity: faqItems,
      },
    ],
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
        <main className="max-w-7xl mx-auto section-padding-y">
          <div className="page-padding">
            <h1 className="text-3xl font-bold text-gray-900">Blog not found</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Schema value={buildBlogGraphSchema(blog, faqs)} />

      <main className="max-w-7xl mx-auto section-padding-y">
        <div className="page-padding">
        <BlogDetailHero blog={blog} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-1 pb-8 sm:pt-6 sm:pb-10">
          <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
            <div className="hidden lg:block">
              <BlogAuthorCard
                author={blog.author}
                authorDesignation={blog.authorDesignation}
                authorAvatar={blog.authorAvatar}
                authorConsultationUrl={blog.authorConsultationUrl}
                socialLinks={blog.authorSocialLinks}
              />
            </div>
            <div className="hidden lg:block">
              <BlogSubscribe />
            </div>
            <div className="hidden lg:block">
              <RelatedPostsSidebar posts={blog.relatedPosts} />
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            {/* Mobile author card above TOC */}
            <div className="lg:hidden mb-4 sm:mb-6 max-w-sm mx-auto">
              <BlogAuthorCard
                author={blog.author}
                authorDesignation={blog.authorDesignation}
                authorAvatar={blog.authorAvatar}
                authorConsultationUrl={blog.authorConsultationUrl}
                socialLinks={blog.authorSocialLinks}
              />
            </div>

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
                    // Use a span wrapper so the image remains valid inside paragraphs
                    // and still behaves like a block with spacing.
                    img: ({ src, alt }) => (
                      <span className="block my-6">
                        <Image
                          src={src || ''}
                          alt={alt || 'Blog image'}
                          title={alt || 'Blog image'}
                          width={800}
                          height={400}
                          className="rounded-lg w-full h-auto"
                          priority={false}
                        />
                      </span>
                    ),
                    a: ({ href, children }) => {
                      const text =
                        typeof children === 'string'
                          ? children
                          : Array.isArray(children)
                          ? children.join(' ')
                          : undefined;
                      return (
                        <a
                          href={href}
                          className="text-purple-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={text || href || undefined}
                        >
                          {children}
                        </a>
                      );
                    },
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

            {/* Mobile subscribe + related blogs below content */}
            <div className="lg:hidden mt-8 mb-6 sm:mb-8 max-w-sm mx-auto space-y-4">
              <BlogSubscribe />
              <RelatedPostsSidebar posts={blog.relatedPosts} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <FAQSection faqs={faqs} />
        </div>
        </div>
      </main>
    </div>
  );
}
