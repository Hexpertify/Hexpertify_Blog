'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface BlogAuthorCardProps {
  author: string;
  authorDesignation?: string;
  authorAvatar?: string;
  authorConsultationUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function BlogAuthorCard({ author, authorDesignation, authorAvatar, authorConsultationUrl, socialLinks }: BlogAuthorCardProps) {
  return (
    <div className="rounded-lg bg-[#A687EF]/50 p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 text-center">Know your Author</h3>

      {/* Mobile: horizontal layout with content vertically centered beside avatar; Desktop: stack vertically with tighter spacing */}
      <div className="flex items-center gap-4 text-left md:flex-col md:items-center md:text-center md:gap-3">
        <div className="flex-shrink-0">
          {authorAvatar ? (
            <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-white/40 flex-shrink-0 md:h-40 md:w-40 md:rounded-2xl">
              <Image src={authorAvatar} alt={author} title={author} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-32 w-32 rounded-lg bg-white/40 flex items-center justify-center md:h-40 md:w-40 md:rounded-2xl">
              <span className="text-2xl font-bold text-gray-900">{author.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 md:w-full md:mt-1">
          <p className="text-sm sm:text-base font-bold text-gray-900 truncate text-center md:text-center">
            {author} <CheckCircle2 className="inline text-blue-500" size={16} />
          </p>
          {authorDesignation && (
            <p className="text-xs text-gray-700 mt-0.5 md:mt-1 text-center md:text-center">({authorDesignation})</p>
          )}

          <div className="mt-3 sm:mt-3 md:mt-4 md:w-full">
            {authorConsultationUrl ? (
              <Link
                href={authorConsultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Book a consultation with ${author}`}
              >
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
