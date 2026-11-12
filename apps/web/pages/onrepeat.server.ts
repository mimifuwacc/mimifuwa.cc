import { defineHandler, defineHead, type InferProps } from "void";
import { siteContent } from "@/server-content";

export const loader = defineHandler(() => ({ tracks: siteContent.tracks }));

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "On Repeat" }));
