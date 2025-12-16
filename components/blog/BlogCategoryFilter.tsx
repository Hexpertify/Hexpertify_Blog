'use client';

import { useState } from 'react';

interface BlogCategoryFilterProps {
  categories: string[];
  onCategoryChange?: (category: string) => void;
}

export default function BlogCategoryFilter({ categories, onCategoryChange }: BlogCategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category
              ? 'text-white shadow-md'
              : 'bg-transparent text-gray-600 border border-gray-300'
          }`}
          style={
            selectedCategory === category
              ? { backgroundColor: '#450BC8', borderColor: '#450BC8', color: 'white' }
              : undefined
          }
          onMouseEnter={(e) => {
            if (selectedCategory !== category) {
              e.currentTarget.style.borderColor = '#450BC8';
              e.currentTarget.style.color = '#450BC8';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== category) {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.color = '';
            }
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
