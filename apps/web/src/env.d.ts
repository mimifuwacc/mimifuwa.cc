interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_API_URL?: string;
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
declare module "*.css?raw" {
  const content: string;
  export default content;
}
