import { defineHandler, defineHead, type InferProps } from "void";
import { siteContent } from "@/server-content";

export const loader = defineHandler(() => ({ links: siteContent.mutuals }));

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Mutuals" }));
