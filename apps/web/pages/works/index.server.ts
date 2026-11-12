import { defineHandler, defineHead, type InferProps } from "void";
import { fixtures } from "@/server-content";

export const loader = defineHandler(() => ({ works: fixtures.works, hasError: false }));

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Works" }));
