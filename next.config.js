/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove appDir if it was set - it's enabled by default in Next.js 14
  },

  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // Only proxy API requests in development mode, not production
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://barracuda.marketing/api/:path*',
        },
      ];
    }
    return [];
  },

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
