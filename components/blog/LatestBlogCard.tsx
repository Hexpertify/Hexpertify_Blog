import Link from 'next/link';
import Image from 'next/image';

interface LatestBlogCardProps {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  imageAlt?: string;
  author: string;
  authorDesignation?: string;
  slug?: string;
  category?: string;
}

export default function LatestBlogCard({ title, description, date, imageUrl, imageAlt, author, authorDesignation, slug = '#' }: LatestBlogCardProps) {
  const categorySlug = categoryToSlug(category);

  function categoryToSlug(cat?: string) {
    if (!cat) return '';
    return String(cat).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const href = categorySlug ? `/blogs/${categorySlug}/${slug}` : `/blog/${slug}`;

  return (
    <Link href={href} title={`Read blog: ${title}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      <div className="relative w-full h-64 bg-gray-200">
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          title={title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 100vw"
          priority
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          By <span className="font-semibold">{author}</span>
          {authorDesignation ? ` • ${authorDesignation}` : ''} • {date}
        </p>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>
    </div>
    </Link>
  );
}
