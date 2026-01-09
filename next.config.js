/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'commedesfous.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
