import { GraphQLClient } from "graphql-request";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";

export const client = {
  request: <T>(document: string, variables?: Record<string, unknown>): Promise<T> => {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) throw new Error("ADMIN_SECRET is not set");
    return new GraphQLClient(GRAPHQL_URL, {
      headers: { "x-admin-secret": secret },
    }).request<T>(document, variables);
  },
};
