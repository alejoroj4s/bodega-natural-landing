/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dropi.co', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'tempfile.aiquickdraw.com', pathname: '/**' },
    ],
  },
}
module.exports = nextConfig
