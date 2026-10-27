import { oxContent } from "@ox-content/vite-plugin";
import type { Plugin, PluginOption } from "vite";

type OxContentOptions = NonNullable<Parameters<typeof oxContent>[0]>;

export interface MimifuwaccContentOptions {
  /** The Ox Content source directory, relative to the Vite root. */
  srcDir: string;
  /** Ox Content collection definitions. Include `html` for publishable article bodies. */
  collections: NonNullable<OxContentOptions["collections"]>;
}

export const mimifuwaccContentOptions = Symbol.for("@mimifuwacc/cli:content-options");

export type MimifuwaccContentPlugin = Plugin & {
  [mimifuwaccContentOptions]: MimifuwaccContentOptions;
};

/** Configure Ox Content for `mimifuwacc deploy`. */
export function mimifuwaccContent(options: MimifuwaccContentOptions): PluginOption[] {
  const plugin: MimifuwaccContentPlugin = {
    name: "@mimifuwacc/cli:content",
    [mimifuwaccContentOptions]: options,
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
