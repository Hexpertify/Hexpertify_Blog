'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, FileText, FolderOpen, HelpCircle, Search } from 'lucide-react';
import { clearAdminSession } from '@/lib/auth';

export default function AdminNav() {
  const router = useRouter();

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard">
              <Image
                src="/purple_logo.jpeg"
                alt="Hexpertify Logo"
                title="Hexpertify Logo"
                width={314}
                height={80}
                className="h-16 w-auto cursor-pointer"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link
                href="/admin/posts"
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
              >
                <FileText size={18} />
                All Posts
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
              >
                <FolderOpen size={18} />
                Categories
              </Link>
              <Link
                href="/admin/faqs"
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
              >
                <HelpCircle size={18} />
                FAQs
              </Link>
              <Link
                href="/admin/seo"
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
              >
                <Search size={18} />
                SEO
              </Link>
            </nav>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
