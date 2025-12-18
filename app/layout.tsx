import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const seo = await SEOHead({
    page: 'homepage',
    fallbackTitle: 'Hexpertify - Connect with Certified Experts',
    fallbackDescription: 'Connect with certified experts across AI, Cloud Computing, Mental Health, Fitness, and Career Development.'
  });

  return {
    ...seo,
    alternates: {
      canonical: 'https://hexpertify.com',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
