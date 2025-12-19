'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export default function BlogSubscribe() {
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // send to API which stores in Supabase
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      // ignore network errors for now
    }

    try {
      // Mark modal shown for session and keep a local record of subscribed emails
      sessionStorage.setItem('blog_subscribe_shown', '1');
      sessionStorage.setItem('subscriber_email', email);
      const list = sessionStorage.getItem('subscriber_emails');
      const arr = list ? JSON.parse(list) : [];
      arr.push({ email, created_at: new Date().toISOString() });
      sessionStorage.setItem('subscriber_emails', JSON.stringify(arr));
    } catch (e) {}

    setEmail('');
    setShowModal(false);
  };

  useEffect(() => {
    // show modal after 15 seconds, only once per session
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const shown = sessionStorage.getItem('blog_subscribe_shown');
      if (!shown) {
        timer = setTimeout(() => {
          setShowModal(true);
        }, 15000);
      }
    } catch (e) {
      // ignore storage errors and still show modal
      timer = setTimeout(() => setShowModal(true), 15000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem('blog_subscribe_shown', '1');
    } catch (e) {}
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-purple-50/50 rounded-lg p-3 sm:p-4 mx-auto max-w-xs sm:max-w-none">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Subscribe Now</h3>
      <p className="text-xs text-gray-600 mb-2.5">Get the Latest Expert Insights</p>

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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-900">Subscribe Now</h3>
                <button aria-label="Close" onClick={handleClose} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Get the Latest Expert Insights</p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter Your Email Id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 rounded-full"
                  required
                />
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-2">
                  Subscribe Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
