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
    <div className="bg-purple-50/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Subscribe Now</h3>
      <p className="text-sm text-gray-600 mb-4">Stay Updated with Frequently Blogs</p>

      <form onSubmit={handleSubscribe} className="space-y-3">
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
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
        >
          Subscribe Now
        </Button>
      </form>
    </div>
  );
}
