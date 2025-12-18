'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <Link href="/">
            <Image
              src="/image.png"
              alt="Hexpertify Blogs Logo"
              width={940}
              height={788}
              className="h-16 w-auto cursor-pointer"
              priority
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
