// 公開記事の読み取りを Cloudflare Cache API (caches.default) でエッジキャッシュする。
// 公開記事はほぼ更新されない読み取り専用データなので、2回目以降は Yoga も D1 も
// 叩かずに Worker 内で即返す。更新は「公開時パージ + 短TTL」で反映する。

// キャッシュ対象の公開クエリ操作名（admin も同名を使うため、ヘッダ有無で別途除外する）
const CACHEABLE_OPERATIONS = new Set(["GetPosts", "GetPost"]);

// エッジキャッシュの TTL（秒）。コロ単位パージの取りこぼしに対する保険も兼ねる
const PUBLIC_MAX_AGE_SECONDS = 300;
const STALE_WHILE_REVALIDATE_SECONDS = 86_400;

// 公開一覧クエリがパージ時に再構築する変数（web の fetchAllPosts と一致させる）
const PUBLIC_LIST_VARIABLES = { filter: { draft: false }, page: { first: 100 } };

export interface GraphQLRequestBody {
  query?: string;
  operationName?: string | null;
  variables?: Record<string, unknown> | null;
}

export function parseGraphQLBody(text: string): GraphQLRequestBody | null {
  try {
    return JSON.parse(text) as GraphQLRequestBody;
  } catch {
    return null;
  }
}

// 変数のキー順に依存しない安定した文字列化（読み取りとパージでキーを一致させる）
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const entries = Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${entries.join(",")}}`;
}

// 操作名 + 変数から決定的なキャッシュキー（合成 GET リクエスト）を作る
function cacheKey(operationName: string, variables: unknown): Request {
  const v = encodeURIComponent(stableStringify(variables ?? {}));
  return new Request(`https://gql-cache.internal/${operationName}?v=${v}`);
}

export function isMutation(body: GraphQLRequestBody): boolean {
  return /^\s*mutation\b/.test(body.query ?? "");
}

// 公開（未認証）の読み取りクエリだけをキャッシュ対象とする
export function isCacheablePublicRead(req: Request, body: GraphQLRequestBody): boolean {
  if (req.headers.has("x-admin-secret")) return false; // 管理側は常に除外
  if (!body.operationName || !CACHEABLE_OPERATIONS.has(body.operationName)) return false;
  return /^\s*query\b/.test(body.query ?? "");
}

function hasGraphQLErrors(text: string): boolean {
  try {
    const json = JSON.parse(text) as { errors?: unknown[] };
    return Array.isArray(json.errors) && json.errors.length > 0;
  } catch {
    return true; // パースできない場合は安全側に倒してキャッシュしない
  }
}

export async function getCached(
  cache: Cache,
  body: GraphQLRequestBody,
): Promise<Response | undefined> {
  if (!body.operationName) return undefined;
  const hit = await cache.match(cacheKey(body.operationName, body.variables));
  if (!hit) return undefined;
  const res = new Response(hit.body, hit);
  res.headers.set("x-cache", "HIT");
  return res;
}

// レスポンス本文（既に読み出した text）をキャッシュへ格納する
export function putCached(
  cache: Cache,
  body: GraphQLRequestBody,
  status: number,
  headers: Record<string, string>,
  text: string,
): Promise<void> | undefined {
  if (!body.operationName) return undefined;
  if (status !== 200 || hasGraphQLErrors(text)) return undefined;

  const cacheHeaders = new Headers(headers);
  cacheHeaders.delete("vary"); // Vary:* だと cache.put が失敗するため除去
  cacheHeaders.delete("set-cookie");
  cacheHeaders.set(
    "Cache-Control",
    `public, s-maxage=${PUBLIC_MAX_AGE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
  );

  return cache.put(
    cacheKey(body.operationName, body.variables),
    new Response(text, { status: 200, headers: cacheHeaders }),
  );
}

function extractSlugs(body: GraphQLRequestBody): string[] {
  const vars = body.variables ?? {};
  const slugs = new Set<string>();
  const input = vars.input as Record<string, unknown> | undefined;
  if (input?.slug) slugs.add(String(input.slug));
  if (input?.newSlug) slugs.add(String(input.newSlug));
  if (typeof vars.slug === "string") slugs.add(vars.slug);
  return [...slugs];
}

// ミューテーション後、関連する公開読み取りキャッシュを削除する（同一コロ内）
export async function purgeForMutation(cache: Cache, body: GraphQLRequestBody): Promise<void> {
  const keys: Request[] = [cacheKey("GetPosts", PUBLIC_LIST_VARIABLES)];
  for (const slug of extractSlugs(body)) {
    keys.push(cacheKey("GetPost", { slug }));
  }
  await Promise.all(keys.map((key) => cache.delete(key)));
}
