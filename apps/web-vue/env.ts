import { defineEnv, string } from "void/env";

export default defineEnv({
  CONTENT_PUBLISH_TOKEN: string().optional(),
});
