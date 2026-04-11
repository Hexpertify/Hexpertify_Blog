import * as React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from '@/components/blog/Header';
import BlogDetailHero from '@/components/blog/BlogDetailHero';
import BlogAuthorCard from '@/components/blog/BlogAuthorCard';
import BlogSubscribe from '@/components/blog/BlogSubscribe';
import FAQSection from '@/components/FAQSection';
import { getPostBySlug, getPublishedPosts } from '@/lib/mdx';
import { getFAQsByPage } from '@/lib/faqs';
import SEOHead from '@/components/SEOHead';
import { getPublicBlogUrl } from '@/lib/public-url';
import Schema from '@/components/Schema';
import { getSEOByPage } from '@/lib/seo';

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
    authorDegreeQualification: post.authorDegreeQualification || '',
    authorSocialLinks: post.authorSocialLinks || {},
    reviewedBy: post.reviewedBy || null,
    primaryTopic: post.primaryTopic || '',
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

// Replace Metadata with a generic type
export async function generateMetadata({ params }: { params?: Promise<{ slug: string }> }): Promise<Record<string, any>> {
  const resolvedParams = params ? await params : undefined;
  const slug = resolvedParams?.slug;
  if (!slug) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
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

function buildBlogGraphSchema(blog: any, faqs: any[], keywords?: string) {
  const blogUrl = getPublicBlogUrl(SITE_URL, blog.slug);

  // Build author object
  const authorSchema: any = {
    '@type': 'Person',
    name: blog.author,
  };

  if (blog.authorDesignation) {
    authorSchema.jobTitle = blog.authorDesignation;
  }

  if (blog.authorBio) {
    authorSchema.description = blog.authorBio;
  }

  if (blog.authorConsultationUrl) {
    authorSchema.url = blog.authorConsultationUrl;
  }

  // Add social links (sameAs)
  if (blog.authorSocialLinks && Object.keys(blog.authorSocialLinks).length > 0) {
    authorSchema.sameAs = Object.values(blog.authorSocialLinks).filter(Boolean);
  }

  // Add credentials if degree is available
  if (blog.authorDegreeQualification) {
    authorSchema.hasCredential = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      educationalLevel: blog.authorDegreeQualification,
    };
  }

  // Build BlogPosting schema
  const blogPostingSchema: any = {
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    image: blog.imageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    datePublished: blog.rawDate,
    author: authorSchema,
    publisher: {
      '@type': 'Organization',
      name: 'Hexpertify',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hexpertify.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FHexpertify%20purple%20logo%20full.dd09ce1d.png&w=1200&q=75',
      },
    },
    articleSection: blog.category,
  };

  // Add dateModified (same as datePublished if no update date available)
  blogPostingSchema.dateModified = blog.rawDate;

  // Add keywords as array if available
  if (keywords) {
    // Split keywords string into array if it's comma-separated
    const keywordArray = keywords
      .split(',')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0);
    if (keywordArray.length > 0) {
      blogPostingSchema.keywords = keywordArray;
    }
  }

  // Add reviewedBy if available
  if (blog.reviewedBy && blog.reviewedBy.name) {
    blogPostingSchema.reviewedBy = {
      '@type': 'Person',
      name: blog.reviewedBy.name,
    };
    if (blog.reviewedBy.designation) {
      blogPostingSchema.reviewedBy.jobTitle = blog.reviewedBy.designation;
    }
  }

  // Add about section with primaryTopic
  if (blog.primaryTopic) {
    blogPostingSchema.about = {
      '@type': 'Thing',
      name: blog.primaryTopic,
    };
  }

  const schemaGraph: any[] = [blogPostingSchema];

  // Add FAQPage schema if FAQs exist
  if (faqs && faqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemaGraph,
  };
}

// Updated BlogDetailPage function
export default async function BlogDetailPage({ params }: { params?: Promise<{ slug: string }> }) {
  const resolvedParams = params ? await params : undefined;
  const slug = resolvedParams?.slug;

  if (!slug) {
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

  console.log('👉 Incoming slug:', slug);

  const blog = await getBlogData(slug);
  const faqs = await getFAQsByPage(slug);
  const seo = await getSEOByPage(`blog-${slug.split('/').pop()}`);

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
      <Schema value={buildBlogGraphSchema(blog, faqs, seo?.keywords)} />
      <main className="max-w-7xl mx-auto section-padding-y">
        <div className="page-padding">
          <BlogDetailHero blog={blog} />
          
          {/* Mobile: Author Card above TOC */}
          <div className="md:hidden mb-6 space-y-4">
            <BlogAuthorCard {...blog} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-1 pb-8 sm:pt-6 sm:pb-10">
            <div className="hidden md:block order-2 lg:order-1 space-y-4 sm:space-y-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
              <BlogAuthorCard {...blog} />
              <BlogSubscribe />
            </div>
            <div className="order-1 lg:order-2 lg:col-span-3">
              {blog.tableOfContents.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6 mb-8">
                  <div className="text-xl font-bold text-center mb-4">Table of Contents</div>
                  <ol className="space-y-2">
                    {blog.tableOfContents.map((item, index) => (
                      <li key={item.id}>
                        <a href={`#${item.anchor}`}>{index + 1}. {item.title}</a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <style>{`
                .prose h2[data-heading-number]::before {
                  content: attr(data-heading-number) '. ';
                  color: black;
                  font-weight: 600;
                }
                .prose h3[data-heading-number]::before {
                  content: attr(data-heading-number) '. ';
                  color: black;
                  font-weight: 600;
                }
              `}</style>
              <div className="prose max-w-none">
                {(() => {
                  const headingState = { h2: 0, h3: 0 };
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => {
                          const text = React.Children.toArray(children).join('').trim();
                          const id = tocAnchorByTitle.get(text);
                          const headingIndex = blog.tableOfContents.findIndex(item => item.title.trim() === text);
                          const headingNumber = headingIndex >= 0 ? headingIndex + 1 : null;
                          if (headingNumber) {
                            headingState.h2 = headingNumber;
                            headingState.h3 = 0;
                          }
                          return (
                            <h2 id={id} {...(headingNumber ? { 'data-heading-number': headingNumber } : {})}>
                              {children}
                            </h2>
                          );
                        },
                        h3: ({ children }) => {
                          headingState.h3++;
                          const subNumber = `${headingState.h2 || 1}.${headingState.h3}`;
                          return (
                            <h3 data-heading-number={subNumber}>
                              {children}
                            </h3>
                          );
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
                        a: ({ href, children }) => (
                          <a href={href} className="text-purple-600 hover:text-purple-800 transition-colors">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {blog.content}
                    </ReactMarkdown>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Mobile: Subscribe below content */}
          <div className="md:hidden mb-6">
            <BlogSubscribe />
          </div>
          <FAQSection faqs={faqs} />
        </div>
      </main>
    </div>
  );
}