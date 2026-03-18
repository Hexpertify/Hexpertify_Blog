'use client';

import { useState } from 'react';
import SectionHeader from '@/components/blog/SectionHeader';
import LatestBlogCard from '@/components/blog/LatestBlogCard';
import TopReadsCard from '@/components/blog/TopReadsCard';
import BlogCategoryFilter from '@/components/blog/BlogCategoryFilter';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import BlogGridCard from '@/components/blog/BlogGridCard';

interface HomePageClientProps {
  latestBlog: any;
  topReads: any[];
  allPosts: any[];
  categories: string[];
}

export default function HomePageClient({
  latestBlog,
  topReads,
  allPosts,
  categories,
}: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredPosts = allPosts
    .filter((post) => selectedCategory === 'All' || post.category === selectedCategory)
    .filter(
      (post) =>
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
      imageAlt: post.imageAlt,
      author: post.author,
      authorDesignation: post.authorDesignation,
      category: post.category,
    }));

  return (
    <>
      {latestBlog && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <SectionHeader title="Latest" />
            <LatestBlogCard {...latestBlog} category={latestBlog.category} />
          </div>

          <div>
            <SectionHeader title="Top Reads" />
            <div className="space-y-4">
              {topReads.map((post) => (
                <TopReadsCard key={post.id} {...post} category={post.category} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <BlogGridCard
              key={post.id}
              title={post.title}
              description={post.description}
              date={post.date}
              imageUrl={post.imageUrl}
              imageAlt={post.imageAlt}
              author={post.author}
              authorDesignation={post.authorDesignation}
              slug={post.slug}
              category={post.category}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            {searchQuery
              ? `No blog posts found matching "${searchQuery}".`
              : selectedCategory === 'All'
              ? 'No blog posts available yet.'
              : `No blog posts found in the "${selectedCategory}" category.`}
          </div>
        )}
      </div>
    </>
  );
}
