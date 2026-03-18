import Header from '@/components/blog/Header';
import FAQSection from '@/components/FAQSection';
import Schema from '@/components/Schema';
import HomePageClient from '@/components/home/HomePageClient';
import { fetchAllPosts, fetchAllCategories } from '@/lib/actions';
import { getFAQsByPage } from '@/lib/faqs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hexpertify-blog-sigma.vercel.app';

async function buildHomePageSchema(faqs: any[]) {
  const schemaGraph: any[] = [
    {
      '@type': 'Organization',
      '@id': 'https://hexpertify.com/#organization',
      name: 'Hexpertify',
      url: 'https://hexpertify.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hexpertify.com/logo.png',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Hexpertify Blogs',
      url: SITE_URL,
      publisher: {
        '@id': 'https://hexpertify.com/#organization',
      },
    },
    {
      '@type': 'Blog',
      '@id': `${SITE_URL}/#blog`,
      name: 'Hexpertify Blogs',
      url: SITE_URL,
      description:
        'Blogs written by certified and verified experts from healthcare, mental health, fitness, technology, and career domains.',
      publisher: {
        '@id': 'https://hexpertify.com/#organization',
      },
    },
  ];

  // Add FAQPage schema if FAQs exist
  if (faqs && faqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
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

export default async function Home() {
  try {
    const [posts, categories, faqs] = await Promise.all([
      fetchAllPosts(),
      fetchAllCategories(),
      getFAQsByPage('homepage'),
    ]);

    const publishedPosts = posts.filter((post: any) => post.published);

    const latestBlog = publishedPosts[0]
      ? {
          slug: publishedPosts[0].slug,
          title: publishedPosts[0].title,
          description: publishedPosts[0].description,
          date: new Date(publishedPosts[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          imageUrl: publishedPosts[0].imageUrl,
          imageAlt: publishedPosts[0].imageAlt,
          author: publishedPosts[0].author,
          authorDesignation: publishedPosts[0].authorDesignation,
          category: publishedPosts[0].category,
        }
      : null;

    const topReads = publishedPosts.slice(0, 3).map((post, index) => ({
      id: index + 1,
      title: post.title,
      date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      imageUrl: post.imageUrl,
      imageAlt: post.imageAlt,
      slug: post.slug,
      author: post.author,
      authorDesignation: post.authorDesignation,
      category: post.category,
    }));

    const hexpertifyHomeSchema = await buildHomePageSchema(faqs);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Schema value={hexpertifyHomeSchema} />
        <main className="section-padding-y">
          <div className="max-w-7xl mx-auto page-padding">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.2]">
                <span className="block bg-gradient-to-r from-purple-700 via-purple-600 to-purple-400 bg-clip-text text-transparent">
                  Blogs by
                </span>
                <span className="mt-2 block bg-gradient-to-r from-purple-700 via-purple-600 to-purple-400 bg-clip-text text-transparent">
                  <span className="font-extrabold">CERTIFIED</span> Experts
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Information you can truly rely on - written by <span className="font-extrabold">CERTIFIED</span> &amp; Verified Experts at Hexpertify.
              </p>
            </div>

            <HomePageClient
              latestBlog={latestBlog}
              topReads={topReads}
              allPosts={publishedPosts}
              categories={categories}
            />

            {faqs && faqs.length > 0 && (
              <div className="mt-16">
                <FAQSection faqs={faqs} title="Frequently Asked Questions" />
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="section-padding-y">
          <div className="max-w-7xl mx-auto page-padding">
            <h1 className="text-3xl font-bold text-gray-900">Error loading page</h1>
          </div>
        </main>
      </div>
    );
  }
}
