/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GRAPHQL_URL:
      process.env.GRAPHQL_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api.mimifuwa.cc/graphql"
        : "http://localhost:8787/graphql"),
  },
};

export default nextConfig;
