'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BlogDetailHeroProps {
  blog: {
    title: string;
    author: string;
    authorDesignation?: string;
    date: string;
    readTime: string;
    imageUrl: string;
    category: string;
  };
}

export default function BlogDetailHero({ blog }: BlogDetailHeroProps) {
  return (
    <div className="pt-2 pb-6 sm:pt-3 sm:pb-8">
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
        <span className="text-purple-600 font-medium">By {blog.author}{blog.authorDesignation ? `, ${blog.authorDesignation}` : ''}</span>
        <span className="text-gray-300">|</span>
        <span>{blog.date}</span>
        <span className="text-gray-300">|</span>
        <span>{blog.readTime}</span>
      </div>

      <div className="w-full sm:w-2/3 lg:w-1/2 mx-auto rounded-lg overflow-hidden mb-2 sm:mb-3 lg:mb-4">
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          title={blog.title}
          width={800}
          height={200}
          className="w-full h-40 sm:h-48 lg:h-56 object-cover"
          priority
        />
      </div>
    </div>
  );
}
