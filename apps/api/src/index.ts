import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { createApp } from "./app";
import { createDB } from "./db";
import { handleOgImage, type ResvgConstructor } from "./routes/og";
import type { Env } from "./types";

let resvgReady = false;
let fontCache: ArrayBuffer | null = null;

async function ensureResvg() {
  if (resvgReady) return;
  await initWasm(resvgWasm);
  resvgReady = true;
}

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff",
  );
  fontCache = await res.arrayBuffer();
  return fontCache;
}

const app = createApp();

app.get("/og/:slug", async (c) => {
  const [font] = await Promise.all([loadFont(), ensureResvg()]);
  const slug = c.req.param("slug");
  const db = createDB(c.env as Env);
  return handleOgImage(slug, db, Resvg as unknown as ResvgConstructor, font);
});

export default app;
