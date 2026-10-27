import { defineHandler } from "void";
import { listContent } from "@/content-api";

export const GET = defineHandler(() => listContent("works"));
