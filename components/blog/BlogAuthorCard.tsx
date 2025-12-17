'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Twitter, Linkedin, Github, CheckCircle2 } from 'lucide-react';

interface BlogAuthorCardProps {
  author: string;
  authorBio?: string;
  authorAvatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function BlogAuthorCard({ author, authorBio, authorAvatar, socialLinks }: BlogAuthorCardProps) {
  return (
    <div className="bg-purple-50/50 rounded-lg p-3 sm:p-4 text-center">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">Know Your Author</h3>

      {authorAvatar ? (
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-lg mx-auto mb-2 overflow-hidden">
          <Image
            src={authorAvatar}
            alt={author}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 mx-auto mb-2 flex items-center justify-center">
          <span className="text-xl sm:text-3xl font-bold text-gray-900">{author.charAt(0)}</span>
        </div>
      )}

      <div className="mb-2">
        <p className="text-gray-900 font-bold text-sm sm:text-base">{author} <CheckCircle2 className="inline text-blue-500" /></p>
        {authorBio && (
          <p className="text-gray-600 text-xs mt-1">{authorBio}</p>
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full py-2 sm:py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Book Consultation
      </Button>
    </div>
  );
}
