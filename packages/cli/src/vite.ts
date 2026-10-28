import { oxContent } from "@ox-content/vite-plugin";
import type { Plugin, PluginOption } from "vite";
import { defineMimifuwaccContentConfig, mimifuwaccContentOptions } from "./config.js";

type OxContentOptions = NonNullable<Parameters<typeof oxContent>[0]>;

export interface MimifuwaccContentOptions {
  /** Public URL of the site that serves the published content. */
  target: { url: string };
  /** The Ox Content source directory, relative to the Vite root. */
  srcDir: string;
  /** Directory containing site-content.json, relative to the Vite root. */
  dataDir?: string;
  /** Ox Content collection definitions. Include `html` for publishable article bodies. */
  collections: NonNullable<OxContentOptions["collections"]>;
}

export type MimifuwaccContentPlugin = Plugin & {
  [mimifuwaccContentOptions]: MimifuwaccContentOptions;
};

/** Configure Ox Content for `mimifuwacc deploy`. */
export function mimifuwaccContent(options: MimifuwaccContentOptions): PluginOption[] {
  const plugin: MimifuwaccContentPlugin = {
    ...defineMimifuwaccContentConfig(options),
    configResolved(config) {
      if (!config.root) throw new Error("Vite root could not be resolved");
    },
  };
  return [
    oxContent({
      srcDir: options.srcDir,
      ssg: false,
      search: false,
      docs: false,
      ogViewer: false,
      highlight: true,
      gfm: true,
      collections: options.collections,
    }),
    plugin,
  ];
}
