import fixtures from "virtual:mimifuwa-content-fixtures";

declare const __MIMIFUWA_CC_DEPLOY_ENV__: string;

export const isDevContent = __MIMIFUWA_CC_DEPLOY_ENV__ === "dev";
export { fixtures };
