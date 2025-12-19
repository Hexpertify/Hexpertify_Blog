"use client";

import * as React from 'react';
import TopReadsCard from '@/components/blog/TopReadsCard';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface RelatedPost {
  slug: string;
  title: string;
  date: string;
  imageUrl: string;
}

interface RelatedPostsSidebarProps {
  posts: RelatedPost[];
}

export default function RelatedPostsSidebar({ posts }: RelatedPostsSidebarProps) {
  if (!posts || posts.length === 0) return null;

  const [api, setApi] = React.useState<CarouselApi | null>(null);

  // Auto-advance the carousel every 5 seconds
  React.useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (!api) return;
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="bg-purple-50/50 rounded-lg p-3 sm:p-4 mt-2">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Related Blogs</h3>
      <p className="text-xs text-gray-600 mb-2.5">Discover more from this category</p>

      <Carousel
        orientation="vertical"
        opts={{ align: 'start', loop: true }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {posts.map((post) => (
            <CarouselItem key={post.slug} className="basis-full">
              <TopReadsCard
                title={post.title}
                date={post.date}
                imageUrl={post.imageUrl}
                slug={post.slug}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </div>
  );
}
