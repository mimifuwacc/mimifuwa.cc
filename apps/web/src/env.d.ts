declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module "*.css";

declare const __APP_VERSION__: string;
declare const __SITE_ORIGIN__: string;
declare const __DEPLOY_ENV__: string;
