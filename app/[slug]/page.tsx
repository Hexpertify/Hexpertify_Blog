import * as React from 'react';
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
import { getPublicBlogUrl } from '@/lib/public-url';
import Schema from '@/components/Schema';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hexpertify.com';

interface TOCItem {
  id: number;
  title: string;
  anchor: string;
}

// ✅ FIXED DATA FETCH
async function getBlogData(slug: string) {
  const cleanSlug = slug.split('/').pop() as string;

  // ✅ IMPORTANT: await here
  const post = await getPostBySlug(cleanSlug);
  const allPosts = await getPublishedPosts();

  if (!post || !post.published) return null;

  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug && p.published && p.category === post.category)
    .slice(0, 5)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: new Date(p.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      imageUrl: p.imageUrl,
      imageAlt: p.imageAlt || '',
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
    authorAvatarAlt: post.authorAvatarAlt || '',
    authorConsultationUrl: post.authorConsultationUrl || '',
    authorSocialLinks: post.authorSocialLinks || {},
    tableOfContents: (post.tableOfContents || []) as TOCItem[],
    date: new Date(post.date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    rawDate: post.date,
    readTime: post.readTime,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt || '',
    category: post.category,
    content: post.content,
    relatedPosts,
  };
}

// ✅ FIXED PARAM TYPE
interface BlogPageParams {
  params: {
    slug: string;
  };
}

// Override Next.js type constraint for PageProps
interface BlogPageParams {
  params: {
    slug: string;
  };
}

declare module 'next' {
  interface PageProps {
    params: BlogPageParams['params'];
  }
}

// Replace Metadata with a generic type
export async function generateMetadata({ params }: BlogPageParams): Promise<Record<string, any>> {
  const slug = params.slug;
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
      canonical: getPublicBlogUrl(SITE_URL, slug),
    },
  };
}

function buildBlogGraphSchema(blog: any, faqs: any[]) {
  const blogUrl = getPublicBlogUrl(SITE_URL, blog.slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    author: blog.author,
    datePublished: blog.rawDate,
    mainEntityOfPage: blogUrl,
  };
}

// Updated BlogDetailPage function
export default async function BlogDetailPage({ params }: BlogPageParams) {
  const slug = params.slug;

  console.log('👉 Incoming slug:', slug);

  const blog = await getBlogData(slug);
  const faqs = await getFAQsByPage(slug);

  console.log('👉 Blog found:', !!blog);

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

  const tocAnchorByTitle = new Map(
    (blog.tableOfContents || []).map((item) => [item.title.trim(), item.anchor])
  );

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
                <BlogAuthorCard {...blog} />
              </div>
              <div className="hidden lg:block">
                <BlogSubscribe />
              </div>
              <div className="hidden lg:block">
                <RelatedPostsSidebar posts={blog.relatedPosts} />
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-3">
              {blog.tableOfContents.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold text-center mb-4">Table of Contents</h3>
                  <ol className="space-y-2">
                    {blog.tableOfContents.map((item, index) => (
                      <li key={item.id}>
                        <a href={`#${item.anchor}`}>{index + 1}. {item.title}</a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => {
                      const text = React.Children.toArray(children).join('').trim();
                      const id = tocAnchorByTitle.get(text);
                      return <h2 id={id}>{children}</h2>;
                    },
                    img: ({ src, alt }) => (
                      <Image
                        src={src || ''}
                        alt={alt || ''}
                        width={800}
                        height={400}
                        className="rounded-lg w-full h-auto"
                      />
                    ),
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          <FAQSection faqs={faqs} />
        </div>
      </main>
    </div>
  );
}