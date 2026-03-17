// `@vercel/microfrontends` removed to avoid install-time peer conflicts.
// If you need microfrontends, reinstall the package and re-enable the wrapper.
/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';
// In development we want no basePath so local dev runs at http://localhost:3000
// In production the app can opt into a basePath by setting NEXT_BASE_PATH or
// fallback to '/blogs' (existing production behavior).
const basePath = isDev ? '' : (process.env.NEXT_BASE_PATH ?? '/blogs');
const assetPrefix = isDev ? '' : (process.env.ASSET_PREFIX ?? basePath);

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath,
  assetPrefix,
  images: { unoptimized: true },
  env: {
    // expose the basePath to the client so we can build absolute URLs
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async redirects() {
    return [
      {
        source: '/:category((?!admin|api|blog|assets|_next).+)/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Map public `/:slug` to the internal route `/blog/:slug`
      {
        source: '/:slug',
        destination: '/blog/:slug',
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'scaling-spork-jj9jvg9rvrjq2pv4p-3001.app.github.dev'],
    },
  },
};

export default nextConfig;
