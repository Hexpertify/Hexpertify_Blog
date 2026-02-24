import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import Analytics from '@/components/Analytics';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Global site tag (gtag.js) - Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-S5X3C2J8LV'}`}
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-S5X3C2J8LV'}');`}
        </Script>
      </head>
      <body className={inter.className}>
        {/* client-side analytics will track route changes */}
        <Analytics />
        {/* client-side analytics will track route changes */}
        <Analytics />
        {children}
        <Footer />
      </body>
    </html>
  );
}


