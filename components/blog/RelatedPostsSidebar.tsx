"use client";

import * as React from 'react';
import AutoScroll from 'embla-carousel-auto-scroll';
import TopReadsCard from '@/components/blog/TopReadsCard';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

interface RelatedPost {
  slug: string;
  title: string;
  date: string;
  imageUrl: string;
  imageAlt?: string;
  author: string;
  authorDesignation?: string;
}

interface RelatedPostsSidebarProps {
  posts: RelatedPost[];
}

export default function RelatedPostsSidebar({ posts }: RelatedPostsSidebarProps) {
  if (!posts || posts.length === 0) return null;

  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const carouselRegionRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!api) return;
    const node = carouselRegionRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      event.preventDefault();

      const autoScroll = (api.plugins() as any)?.autoScroll;
      autoScroll?.stop?.();

      // Resume slow auto-scroll shortly after user input
      window.setTimeout(() => {
        const resume = (api.plugins() as any)?.autoScroll;
        resume?.play?.();
      }, 1500);

      if (event.deltaY > 0) {
        api.scrollNext();
      } else {
        api.scrollPrev();
      }
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [api]);

  return (
    <div className="bg-purple-50/50 rounded-lg p-3 sm:p-4 mt-2">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Related Blogs</h3>
      <p className="text-xs text-gray-600 mb-2.5">Discover more from this category</p>

      <Carousel
        ref={carouselRegionRef}
        orientation="vertical"
        opts={{ align: 'start', loop: true, skipSnaps: true }}
        plugins={[
          AutoScroll({
            playOnInit: true,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            speed: 0.35,
          }) as any,
        ]}
        setApi={setApi}
        className="w-full h-96 touch-pan-x"
      >
        <CarouselContent className="mt-4">
          {posts.map((post) => (
            <CarouselItem key={post.slug} className="basis-1/3 pt-0 pb-3">
              <TopReadsCard
                title={post.title}
                date={post.date}
                imageUrl={post.imageUrl}
                imageAlt={post.imageAlt}
                slug={post.slug}
                author={post.author}
                authorDesignation={post.authorDesignation}
                compact
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
