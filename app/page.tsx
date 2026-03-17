'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/blog/Header';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="section-padding-y">
        <div className="max-w-7xl mx-auto page-padding">
          <h1 className="text-4xl font-extrabold">Welcome to Hexpertify Blogs</h1>
        </div>
      </main>
    </div>
  );
}
