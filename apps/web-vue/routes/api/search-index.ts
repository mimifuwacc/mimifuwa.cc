import { defineHandler } from "void";
import { getSearchIndex } from "@/content-api";

export const GET = defineHandler(() => getSearchIndex());
