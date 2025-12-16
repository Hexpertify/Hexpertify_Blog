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
    <div className="bg-purple-50/50 rounded-lg p-6 text-center">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Know Your Author</h3>

      {authorAvatar ? (
        <div className="relative w-32 h-32 rounded-lg mx-auto mb-4 overflow-hidden">
          <Image
            src={authorAvatar}
            alt={author}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{author.charAt(0)}</span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-900 font-bold text-lg">{author} <CheckCircle2 className="inline text-blue-500" /></p>
        {authorBio && (
          <p className="text-gray-600 text-sm mt-2">{authorBio}</p>
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Book Consultation
      </Button>
    </div>
  );
}
