'use client';

import Image from 'next/image';
import blogImg from '../../assets/uploads/blogs/blog.jpeg';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-[0_4px_4px_3px_rgba(0,0,0,0.25)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <a href="https://hexpertify.com/blogs" className="ml-2">
              <Image
                src={blogImg}
                alt="Blog"
                title="Blog"
                width={150}
                height={36}
                className="h-10 w-auto cursor-pointer"
                priority
              />
            </a>
          </div>

          <section className="hidden md:flex justify-center items-center gap-[30px]">
            <ul className="flex menuText gap-[40px] cursor-pointer items-center">
              <li><a href="https://hexpertify.com/" className="font-bold text-sm hover:text-[#450bc8] transition-colors">Home</a></li>
              <li><a href="https://hexpertify.com/blogs" className="font-bold text-sm hover:text-[#450bc8] transition-colors">Blogs</a></li>
              <li><a href="https://hexpertify.com/services" className="font-bold text-sm hover:text-[#450bc8] transition-colors">Services</a></li>
              <li><a href="https://hexpertify.com/about-us" className="font-bold text-sm hover:text-[#450bc8] transition-colors">About Us</a></li>
              <li><a href="https://hexpertify.com/contact-us" className="font-bold text-sm hover:text-[#450bc8] transition-colors">Contact Us</a></li>
            </ul>
            <div className="flex gap-[10px]" />
          </section>

          <div className="md:hidden flex items-center">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="text-gray-700 focus:outline-none"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay & drawer */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} onClick={() => setOpen(false)} />
      <div className={`fixed top-0 right-0 h-full w-[75%] sm:w-[60%] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-6 h-full overflow-y-auto">
          <div className="flex justify-end mb-8">
            <button onClick={() => setOpen(false)} className="text-gray-700 hover:text-red-500 transition-colors" aria-label="Close menu">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

              <ul className="flex flex-col gap-6 text-base text-gray-800">
                <li><a href="https://hexpertify.com/" onClick={() => setOpen(false)} className="font-bold hover:text-[#450bc8] transition-colors">Home</a></li>
                <li><a href="https://hexpertify.com/blogs" onClick={() => setOpen(false)} className="font-bold hover:text-[#450bc8] transition-colors">Blogs</a></li>
                <li><a href="https://hexpertify.com/services" onClick={() => setOpen(false)} className="font-bold hover:text-[#450bc8] transition-colors">Services</a></li>
                <li><a href="https://hexpertify.com/about-us" onClick={() => setOpen(false)} className="font-bold hover:text-[#450bc8] transition-colors">About Us</a></li>
                <li><a href="https://hexpertify.com/contact-us" onClick={() => setOpen(false)} className="font-bold hover:text-[#450bc8] transition-colors">Contact Us</a></li>
              </ul>

        </div>
      </div>
    </header>
  );
}
