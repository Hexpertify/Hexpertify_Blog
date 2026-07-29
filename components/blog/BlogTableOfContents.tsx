'use client';

interface BlogTableOfContentsProps {
  items: string[];
}

export default function BlogTableOfContents({ items }: BlogTableOfContentsProps) {
  return (
    <div className="bg-purple-50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h3>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}
