import type { MimifuwaccContentOptions } from "./vite.js";

export type { MimifuwaccContentOptions } from "./vite.js";

export const mimifuwaccContentOptions = Symbol.for("@mimifuwa.cc/cli:content-options");

/** Add content publishing metadata to a Vite config without loading the content plugin. */
export function defineMimifuwaccContentConfig(options: MimifuwaccContentOptions) {
  return {
    name: "@mimifuwa.cc/cli:content-config",
    [mimifuwaccContentOptions]: options,
  };
}
