// `@vercel/microfrontends` removed to avoid install-time peer conflicts.
// If you need microfrontends, reinstall the package and re-enable the wrapper.
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: '/blogs',
  assetPrefix: '/blogs',
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'scaling-spork-jj9jvg9rvrjq2pv4p-3001.app.github.dev'],
    },
  },
};

export default nextConfig;
