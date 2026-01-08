/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['commedesfous.com'],
  },
  swcMinify: true,
  experimental: {
    bundleAnalyzer: true,
  },
};

module.exports = nextConfig;
