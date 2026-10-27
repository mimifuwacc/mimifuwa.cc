import { oxContent } from "@ox-content/vite-plugin";
import type { Plugin, PluginOption } from "vite";

type OxContentOptions = NonNullable<Parameters<typeof oxContent>[0]>;

export interface MimifuwaccContentTarget {
  url: string;
  token?: string;
}

export interface MimifuwaccContentOptions {
  /** The Ox Content source directory, relative to the Vite root. */
  srcDir: string;
  /** Ox Content collection definitions. Include `html` for publishable article bodies. */
  collections: NonNullable<OxContentOptions["collections"]>;
  /** The content publish API for this repository. */
  target: MimifuwaccContentTarget;
  /** Directory containing the generated publish payload. Defaults to Vite's outDir. */
  outDir?: string;
}

export const mimifuwaccContentOptions = Symbol.for("@mimifuwacc/cli:content-options");

export type MimifuwaccContentPlugin = Plugin & {
  [mimifuwaccContentOptions]: MimifuwaccContentOptions;
};

/** Configure Ox Content and attach its publish target for `mimifuwacc deploy`. */
export function mimifuwaccContent(options: MimifuwaccContentOptions): PluginOption[] {
  const plugin: MimifuwaccContentPlugin = {
    name: "@mimifuwacc/cli:content",
    [mimifuwaccContentOptions]: options,
    configResolved(config) {
      const targetUrl = new URL(options.target.url);
      if (targetUrl.protocol !== "https:" && targetUrl.hostname !== "localhost") {
        throw new Error("mimifuwaccContent target URL must use HTTPS");
      }
      if (options.outDir && !options.outDir.trim()) {
        throw new Error("mimifuwaccContent outDir cannot be empty");
      }
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
