'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function BlogSubscribe() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <div className="bg-purple-50/50 rounded-lg p-3 sm:p-4">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Subscribe Now</h3>
      <p className="text-xs text-gray-600 mb-2.5">Stay Updated with Frequently Blogs</p>

      <form onSubmit={handleSubscribe} className="space-y-2">
        <Input
          type="email"
          placeholder="Enter Your Email Id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-gray-300 rounded-full"
          required
        />
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-2"
        >
          Subscribe Now
        </Button>
      </form>
    </div>
  );
}
