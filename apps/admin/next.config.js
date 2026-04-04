/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GRAPHQL_URL:
      process.env.GRAPHQL_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api.mimifuwa.cc/graphql"
        : "https://mimifuwacc-api-devel.mimifuwacc.workers.dev/graphql"),
  },
};

export default nextConfig;
