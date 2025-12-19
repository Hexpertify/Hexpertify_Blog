import Link from 'next/link';
import Image from 'next/image';

interface TopReadsCardProps {
  title: string;
  date: string;
  imageUrl: string;
  slug: string;
}

export default function TopReadsCard({ title, date, imageUrl, slug }: TopReadsCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block" title={`Read blog: ${title}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex gap-4 p-4">
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded">
          <Image
            src={imageUrl}
            alt={title}
            title={title}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
            {title}
          </h4>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
    </Link>
  );
}
