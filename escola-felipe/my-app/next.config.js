/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig