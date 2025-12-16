'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/blog/Header';
import SectionHeader from '@/components/blog/SectionHeader';
import LatestBlogCard from '@/components/blog/LatestBlogCard';
import TopReadsCard from '@/components/blog/TopReadsCard';
import BlogCategoryFilter from '@/components/blog/BlogCategoryFilter';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import BlogGridCard from '@/components/blog/BlogGridCard';
import FAQSection from '@/components/FAQSection';
import { fetchAllPosts, fetchAllCategories, fetchFAQsByPage } from '@/lib/actions';

export default function Home() {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [posts, cats, homepageFaqs] = await Promise.all([
        fetchAllPosts(),
        fetchAllCategories(),
        fetchFAQsByPage('homepage')
      ]);
      const publishedPosts = posts.filter(post => post.published);
      setAllPosts(publishedPosts);
      setFilteredPosts(publishedPosts);
      setCategories(cats);
      setFaqs(homepageFaqs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredPosts(allPosts);
    } else {
      const filtered = allPosts.filter(post => post.category === category);
      setFilteredPosts(filtered);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const latestBlog = allPosts[0] ? {
    slug: allPosts[0].slug,
    title: allPosts[0].title,
    description: allPosts[0].description,
    date: new Date(allPosts[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    imageUrl: allPosts[0].imageUrl,
  } : null;

  const topReads = allPosts.slice(0, 3).map((post, index) => ({
    id: index + 1,
    title: post.title,
    date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    imageUrl: post.imageUrl,
  }));

  const blogPosts = filteredPosts
    .filter(post =>
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((post, index) => ({
      id: index,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      imageUrl: post.imageUrl,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center mb-12">
            <Image
              src="/blog.jpeg"
              alt="Blogs by Certified Experts"
              width={400}
              height={150}
              className="h-24 w-auto"
              priority
            />
          </div>

          {latestBlog && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="lg:col-span-2">
                <SectionHeader title="Latest" />
                <LatestBlogCard {...latestBlog} />
              </div>

              <div>
                <SectionHeader title="Top Reads" />
                <div className="space-y-4">
                  {topReads.map((post) => (
                    <TopReadsCard key={post.id} {...post} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Browse by Categories</h2>
              <BlogSearchBar onSearch={handleSearch} />
            </div>
            <div className="w-full rounded-full border border-gray-300 bg-white px-6 py-4">
              <BlogCategoryFilter categories={categories} onCategoryChange={handleCategoryChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <BlogGridCard key={post.id} title={post.title} description={post.description} date={post.date} imageUrl={post.imageUrl} slug={post.slug} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                {searchQuery
                  ? `No blog posts found matching "${searchQuery}".`
                  : selectedCategory === 'All'
                    ? 'No blog posts available yet.'
                    : `No blog posts found in the "${selectedCategory}" category.`
                }
              </div>
            )}
          </div>

          <FAQSection faqs={faqs} />
        </div>
      </main>
    </div>
  );
}
