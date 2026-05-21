import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { createApp } from "./app";
import { createDB } from "./db";
import fontBold from "./routes/fonts/NotoSansJP-Bold.ttf";
import { handleOgImage, type ResvgConstructor } from "./routes/og";
import type { Env } from "./types";

let resvgReady = false;

async function ensureResvg() {
  if (resvgReady) return;
  await initWasm(resvgWasm);
  resvgReady = true;
}

const app = createApp();

app.get("/og/:slug", async (c) => {
  await ensureResvg();
  const slug = c.req.param("slug");
  const db = createDB(c.env as Env);
  return handleOgImage(slug, db, Resvg as unknown as ResvgConstructor, fontBold);
});

export default app;
