/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
};

module.exports = nextConfig; 