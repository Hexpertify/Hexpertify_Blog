'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BlogDetailHeroProps {
  blog: {
    title: string;
    author: string;
    date: string;
    readTime: string;
    imageUrl: string;
    category: string;
  };
}

export default function BlogDetailHero({ blog }: BlogDetailHeroProps) {
  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>›</span>
        <Link href="/" className="hover:text-gray-900">
          Blog
        </Link>
        <span>›</span>
        <Link href="/" className="hover:text-gray-900">
          {blog.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900 break-words">{blog.title}</span>
      </div>

      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
        {blog.title}
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
        <span className="text-purple-600 font-medium">By {blog.author}</span>
        <span className="text-gray-300">|</span>
        <span>{blog.date}</span>
        <span className="text-gray-300">|</span>
        <span>{blog.readTime}</span>
      </div>

      <div className="w-full sm:w-3/4 mx-auto rounded-lg overflow-hidden mb-6 sm:mb-8">
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          width={800}
          height={200}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
    </div>
  );
}
