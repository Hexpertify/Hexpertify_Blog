import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hexpertify-blog-sigma.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await SEOHead({
    page: 'homepage',
    fallbackTitle: 'hexpertify-blogs - Connect with Certified Experts',
    fallbackDescription: 'hexpertify-blogs - Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development.'
  });

  return {
    ...seo,
    alternates: {
      canonical: SITE_URL,
    },
  };
}

import Schema from '@/components/Schema';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'hexpertify-blogs',
    url: SITE_URL,
    description:
      'hexpertify-blogs - Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development.',
    publisher: {
      '@type': 'Organization',
      name: 'hexpertify-blogs',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo.png`,
      },
    },
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <Schema value={siteSchema} />
        {children}
        <Footer />
      </body>
    </html>
  );
}


