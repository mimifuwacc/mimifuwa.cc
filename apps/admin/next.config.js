/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.GRAPHQL_URL || 'http://localhost:8787/graphql',
  },
}

export default nextConfig
