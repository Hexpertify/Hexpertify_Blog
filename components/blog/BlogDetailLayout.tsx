'use client';

import Image from 'next/image';

interface Section {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

interface BlogDetailLayoutProps {
  blog: {
    content: string;
    sections: Section[];
  };
}

export default function BlogDetailLayout({ blog }: BlogDetailLayoutProps) {
  return (
    <div className="space-y-8">
      <p className="text-gray-700 leading-relaxed text-justify">{blog.content}</p>

      <div className="flex justify-center my-12">
        <div className="bg-purple-50 rounded-lg p-8 w-full max-w-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Table of Contents</h3>
          <ol className="space-y-3 text-gray-700">
            {blog.sections.map((section) => (
              <li key={section.id} className="text-sm leading-relaxed">
                {section.title}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {blog.sections.map((section) => (
        <div key={section.id}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {section.title}
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6 text-justify">{section.content}</p>

          {section.imageUrl && (
            <div className="rounded-lg overflow-hidden mb-8">
              <Image
                src={section.imageUrl}
                alt={section.title}
                title={section.title}
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
