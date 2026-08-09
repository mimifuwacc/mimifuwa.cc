/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API_V2_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace Cloudflare {
  interface Env {
    readonly CONTENT_API: ContentApiFetcher;
  }
}

interface ContentApiFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
}
