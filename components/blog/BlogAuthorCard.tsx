'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface BlogAuthorCardProps {
  author: string;
  authorBio?: string;
  authorAvatar?: string;
  authorConsultationUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function BlogAuthorCard({ author, authorBio, authorAvatar, authorConsultationUrl, socialLinks }: BlogAuthorCardProps) {
  return (
    <div className="rounded-lg bg-[#A687EF]/50 p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 text-center">Know your Author</h3>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:text-left text-center">
        <div className="flex-shrink-0">
          {authorAvatar ? (
            <div className="relative h-36 w-24 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-white/40 mx-auto">
              <Image src={authorAvatar} alt={author} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-36 w-24 sm:h-24 sm:w-24 rounded-lg bg-white/40 flex items-center justify-center mx-auto">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{author.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
            {author} <CheckCircle2 className="inline text-blue-500" size={16} />
          </p>
          {authorBio && <p className="text-xs text-gray-700 mt-0.5">({authorBio})</p>}

          <div className="mt-2 sm:mt-3">
            {authorConsultationUrl ? (
              <Link href={authorConsultationUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-full bg-[#450BC8] hover:bg-[#3709A0] text-white py-2 text-sm font-semibold">
                  Book Consultation
                </Button>
              </Link>
            ) : (
              <Button className="w-full rounded-full bg-[#450BC8] hover:bg-[#3709A0] text-white py-2 text-sm font-semibold" disabled>
                Book Consultation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
