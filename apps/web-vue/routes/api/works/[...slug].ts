import { defineHandler } from "void";
import { getContent } from "@/content-api";

export const GET = defineHandler((c) => getContent("works", c.req.param("slug") ?? ""));
