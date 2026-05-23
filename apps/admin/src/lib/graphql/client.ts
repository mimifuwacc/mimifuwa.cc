import { GraphQLClient } from "graphql-request";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";
const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) throw new Error("ADMIN_SECRET is not set");

export const client = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    "x-admin-secret": ADMIN_SECRET,
  },
});
