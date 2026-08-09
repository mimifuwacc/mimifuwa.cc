/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API_V2_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
