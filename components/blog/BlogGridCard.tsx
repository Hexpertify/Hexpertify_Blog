import Link from 'next/link';
import Image from 'next/image';

interface BlogGridCardProps {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  slug?: string;
}

export default function BlogGridCard({ title, description, date, imageUrl, slug = '#' }: BlogGridCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
      <div className="relative w-full h-36 sm:h-48 bg-gray-200">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-2">{date}</p>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>
      </div>
    </div>
    </Link>
  );
}
