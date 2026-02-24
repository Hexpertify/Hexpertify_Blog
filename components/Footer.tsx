import Link from 'next/link';
import Image from 'next/image';
import nImg from '../assets/uploads/blogs/n.png';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    home: [
      { label: 'Home', href: 'https://hexpertify.com' },
      { label: 'Categories', href: 'https://hexpertify.com/services/doctors-hexpertify#:~:text=Home-,Categories,-Recently%20Onboarded' },
      { label: 'Recently Onboarded', href: 'https://hexpertify.com/#recently-onboarded' },
      { label: 'Top Consultants', href: 'https://hexpertify.com/#top-consultants' },
    ],
    services: [
      { label: 'Services', href: 'https://hexpertify.com/services' },
      { label: '1:1 Online Consultation', href: 'https://hexpertify.com/#categories' },
      { label: 'Hire A Mentor', href: 'https://hexpertify.com/hire-a-mentor' },
      { label: 'Webinars', href: 'https://hexpertify.com/services/corporate-webinars-and-group-sessions' },
    ],
    about: [
      { label: 'About Us', href: 'https://hexpertify.com/about-us' },
      { label: 'Terms & Conditions', href: 'https://hexpertify.com/terms-conditions' },
      { label: 'Privacy Policy', href: 'https://hexpertify.com/privacy-policy' },
      { label: 'Refund Policy', href: 'https://hexpertify.com/refund-policy' },
    ],
    contact: [
      { label: 'Contact Us', href: 'https://hexpertify.com/contact-us' },
      { label: 'Call Us', href: 'tel:+918940506900' },
      { label: 'Email Us', href: 'mailto:hexpertifyapp@gmail.com' },
      { label: 'Join as Consultant', href: 'https://hexpertify.com/contact-us' },
    ],
  };

  return (
    <footer className="text-gray-900">
      <div className="bg-[#A687EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 items-start">
            <div className="md:col-span-1 order-last md:order-first">
              <div className="mb-4 flex justify-center md:justify-start">
                <div className="w-[160px]">
                  <Image
                    src={nImg}
                    alt="Hexpertify Logo"
                    title="Hexpertify Logo"
                    width={160}
                    height={64}
                    className="h-auto mx-auto md:mx-0"
                  />

                  <div className="mt-1 flex justify-center">
                    <div className="w-full flex justify-center items-center gap-4">
                      <Link
                        href="https://www.instagram.com/hexpertify"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:opacity-80 transition-opacity"
                        aria-label="Instagram"
                      >
                        <Instagram size={22} />
                      </Link>
                      <Link
                        href="https://x.com/hexpertifyapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:opacity-80 transition-opacity"
                        aria-label="X"
                      >
                        <Twitter size={22} />
                      </Link>
                      <Link
                        href="https://www.linkedin.com/company/hexpertify"
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
                      title={link.label}
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
                      title={link.label}
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
                      title={link.label}
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
                      title={link.label}
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
