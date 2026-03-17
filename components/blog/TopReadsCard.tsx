import Link from 'next/link';
import Image from 'next/image';

interface TopReadsCardProps {
  title: string;
  date: string;
  imageUrl: string;
  imageAlt?: string;
  slug: string;
  author: string;
  authorDesignation?: string;
  compact?: boolean;
  category?: string;
}

export default function TopReadsCard({
  title,
  date,
  imageUrl,
  imageAlt,
  slug,
  author,
  authorDesignation,
  compact = false,
  category,
}: TopReadsCardProps) {
  const containerClasses = compact
    ? 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex gap-3 p-3'
    : 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex gap-4 p-4';

  const imageWrapperClasses = compact
    ? 'relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded'
    : 'relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded';

  const titleClasses = compact
    ? 'text-[13px] font-semibold text-gray-900 mb-0.5 line-clamp-2'
    : 'text-sm font-semibold text-gray-900 mb-1 line-clamp-2';

  const categorySlug = category ? String(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
  const href = categorySlug ? `/${categorySlug}/${slug}` : `/${slug}`;

  return (
    <Link href={href} className="block" title={`Read blog: ${title}`}>
      <div className={containerClasses}>
        <div className={imageWrapperClasses}>
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            title={title}
            fill
            className="object-cover rounded"
            sizes={compact ? '64px' : '96px'}
          />
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h4 className={titleClasses}>{title}</h4>
          <p className="text-[11px] text-gray-500">
            By <span className="font-semibold">{author}</span>
            {authorDesignation ? ` • ${authorDesignation}` : ''} • {date}
          </p>
        </div>
      </div>
    </Link>
  );
}
