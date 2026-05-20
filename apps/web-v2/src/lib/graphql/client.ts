import { GraphQLClient } from "graphql-request";

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8787/graphql";

export const client = new GraphQLClient(GRAPHQL_URL);
