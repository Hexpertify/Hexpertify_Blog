import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    home: [
      { label: 'Categories', href: '/blog' },
      { label: 'Recently Onboarded', href: '/services' },
      { label: 'Top Consultants', href: '/services' },
    ],
    services: [
      { label: '1:1 Online Consulting', href: '/services' },
      { label: 'Hire A Mentor', href: '/services' },
      { label: 'Webinars', href: '/services' },
    ],
    about: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refund-policy' },
    ],
    contact: [
      { label: 'Call Us', href: '/contact' },
      { label: 'Email Us', href: '/contact' },
      { label: 'Join as Consultant', href: '/join-as-consultant' },
    ],
  };

  return (
    <footer className="text-gray-900">
      <div className="bg-[#d0bcff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 items-start">
            <div className="md:col-span-1 order-last md:order-first">
              <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                <div className="mb-4 md:mb-0 flex justify-center md:justify-start">
                  <Image
                    src="/n.png"
                    alt="Hexpertify Logo"
                    width={160}
                    height={64}
                    className="h-auto"
                  />
                </div>

                <div className="flex justify-center md:justify-start items-center gap-4 mt-3 md:mt-0">
                  <Link
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:opacity-80 transition-opacity"
                    aria-label="Instagram"
                  >
                    <Instagram size={22} />
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:opacity-80 transition-opacity"
                    aria-label="X"
                  >
                    <Twitter size={22} />
                  </Link>
                  <Link
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:opacity-80 transition-opacity"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={22} />
                  </Link>
                </div>
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

            <div>
              <h3 className="font-semibold text-base mb-4">About Us</h3>
              <ul className="space-y-2">
                {footerLinks.about.map((link) => (
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
              <h3 className="font-semibold text-base mb-4">Contact</h3>
              <ul className="space-y-2">
                {footerLinks.contact.map((link) => (
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
        </div>
      </div>

      <div className="bg-[#450BC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-white text-center">© {new Date().getFullYear()} Hexpertify. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
