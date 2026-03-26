/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.shopify.com'],
  },
}

module.exports = nextConfig
