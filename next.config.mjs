/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  // ✅ Only use basePath in production
  basePath: isDev ? '' : '/blogs',

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },

  // ❌ REMOVE redirects (they were breaking URLs)
  // ❌ REMOVE rewrites (they were causing duplication)
  // ❌ REMOVE assetPrefix (causes _next/static issues)
  // ❌ REMOVE env basePath exposure (not needed)

  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'scaling-spork-jj9jvg9rvrjq2pv4p-3001.app.github.dev',
      ],
    },
  },
};

export default nextConfig;