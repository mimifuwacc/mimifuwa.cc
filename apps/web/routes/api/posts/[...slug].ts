import { defineHandler } from "void";
import { getContent } from "@/content-api";

export const GET = defineHandler((c) => getContent("posts", c.req.param("slug") ?? ""));
