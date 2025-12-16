import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    home: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
    ],
    services: [
      { label: 'All Posts', href: '/blog' },
    ],
  };

  return (
    <footer className="bg-[#9b7fd4] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/n.png"
                alt="Expertify Logo"
                width={140}
                height={60}
                className="h-auto"
              />
            </div>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Twitter size={20} />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Home</h3>
            <ul className="space-y-2">
              {footerLinks.home.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:opacity-80 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:opacity-80 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Hexpertify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
