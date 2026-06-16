import { describe, expect, it } from "vitest";
import {
  type GraphQLRequestBody,
  getCached,
  isCacheablePublicRead,
  isMutation,
  parseGraphQLBody,
  purgeForMutation,
  putCached,
} from "./cache";

// Cloudflare の Cache API を模した、URL をキーとするインメモリ実装
class FakeCache {
  readonly store = new Map<string, Response>();

  async match(request: Request): Promise<Response | undefined> {
    const cached = this.store.get(request.url);
    return cached ? cached.clone() : undefined;
  }

  async put(request: Request, response: Response): Promise<void> {
    this.store.set(request.url, response);
  }

  async delete(request: Request): Promise<boolean> {
    return this.store.delete(request.url);
  }
}

function makeCache() {
  return new FakeCache() as unknown as Cache;
}

// 公開リクエスト（admin ヘッダ無し）を組み立てる
function publicRequest(): Request {
  return new Request("https://api.example.com/graphql", { method: "POST" });
}

// 管理リクエスト（admin ヘッダ有り）を組み立てる
function adminRequest(): Request {
  return new Request("https://api.example.com/graphql", {
    method: "POST",
    headers: { "x-admin-secret": "secret" },
  });
}

const getPostsBody: GraphQLRequestBody = {
  operationName: "GetPosts",
  query: "query GetPosts { blogPosts { edges { node { slug } } } }",
  variables: { filter: { draft: false }, page: { first: 100 } },
};

const getPostBody = (slug: string): GraphQLRequestBody => ({
  operationName: "GetPost",
  query: "query GetPost($slug: String!) { blogPost(slug: $slug) { id } }",
  variables: { slug },
});

describe("parseGraphQLBody", () => {
  it("正常な JSON をパースする", () => {
    expect(parseGraphQLBody('{"operationName":"GetPosts"}')).toEqual({
      operationName: "GetPosts",
    });
  });

  it("不正な JSON は null を返す", () => {
    expect(parseGraphQLBody("not json")).toBeNull();
  });
});

describe("isCacheablePublicRead（公開読み取りの判定）", () => {
  it("ヘッダ無しの GetPosts クエリはキャッシュ対象", () => {
    expect(isCacheablePublicRead(publicRequest(), getPostsBody)).toBe(true);
  });

  it("ヘッダ無しの GetPost クエリはキャッシュ対象", () => {
    expect(isCacheablePublicRead(publicRequest(), getPostBody("foo"))).toBe(true);
  });

  it("x-admin-secret 付きは同名操作でも対象外", () => {
    expect(isCacheablePublicRead(adminRequest(), getPostsBody)).toBe(false);
  });

  it("許可リスト外の操作名は対象外", () => {
    expect(
      isCacheablePublicRead(publicRequest(), {
        operationName: "GetTags",
        query: "query GetTags { tags { name } }",
      }),
    ).toBe(false);
  });

  it("operationName が無いものは対象外", () => {
    expect(isCacheablePublicRead(publicRequest(), { query: "query { blogPosts { edges } }" })).toBe(
      false,
    );
  });

  it("操作名が許可リストでも本文が mutation なら対象外", () => {
    expect(
      isCacheablePublicRead(publicRequest(), {
        operationName: "GetPosts",
        query: "mutation GetPosts { createBlogPost { success } }",
      }),
    ).toBe(false);
  });
});

describe("isMutation", () => {
  it("mutation 本文は true", () => {
    expect(isMutation({ query: "mutation CreatePost { createBlogPost { success } }" })).toBe(true);
  });

  it("query 本文は false", () => {
    expect(isMutation(getPostsBody)).toBe(false);
  });
});

describe("putCached / getCached（格納と取得）", () => {
  it("200・エラー無しを格納し、同じ body で HIT する", async () => {
    const cache = makeCache();
    const text = '{"data":{"blogPosts":{"edges":[]}}}';
    await putCached(cache, getPostsBody, 200, { "content-type": "application/json" }, text);

    const hit = await getCached(cache, getPostsBody);
    expect(hit).toBeDefined();
    expect(hit?.headers.get("x-cache")).toBe("HIT");
    expect(await hit?.text()).toBe(text);
  });

  it("変数のキー順が違っても同じキーで HIT する（決定的キー）", async () => {
    const cache = makeCache();
    await putCached(cache, getPostsBody, 200, {}, '{"data":{}}');

    // filter と page を逆順にした同等の変数
    const reordered: GraphQLRequestBody = {
      operationName: "GetPosts",
      query: getPostsBody.query,
      variables: { page: { first: 100 }, filter: { draft: false } },
    };
    expect(await getCached(cache, reordered)).toBeDefined();
  });

  it("status が 200 以外は格納しない", async () => {
    const cache = makeCache();
    await putCached(cache, getPostsBody, 500, {}, '{"data":{}}');
    expect(await getCached(cache, getPostsBody)).toBeUndefined();
  });

  it("GraphQL エラーを含むレスポンスは格納しない", async () => {
    const cache = makeCache();
    await putCached(cache, getPostsBody, 200, {}, '{"errors":[{"message":"boom"}]}');
    expect(await getCached(cache, getPostsBody)).toBeUndefined();
  });

  it("格納時に Cache-Control を付与し Vary/Set-Cookie を除去する", async () => {
    const cache = makeCache() as unknown as FakeCache;
    await putCached(
      cache as unknown as Cache,
      getPostsBody,
      200,
      { vary: "*", "set-cookie": "a=1", "content-type": "application/json" },
      '{"data":{}}',
    );

    const stored = [...cache.store.values()][0];
    expect(stored.headers.get("cache-control")).toContain("s-maxage=300");
    expect(stored.headers.get("cache-control")).toContain("stale-while-revalidate=86400");
    expect(stored.headers.get("vary")).toBeNull();
    expect(stored.headers.get("set-cookie")).toBeNull();
  });

  it("未格納なら getCached は undefined", async () => {
    expect(await getCached(makeCache(), getPostsBody)).toBeUndefined();
  });
});

describe("purgeForMutation（公開時パージ）", () => {
  it("更新後、公開一覧キャッシュを無効化する（一覧キーが一致する保証）", async () => {
    const cache = makeCache();
    await putCached(cache, getPostsBody, 200, {}, '{"data":{}}');
    expect(await getCached(cache, getPostsBody)).toBeDefined();

    await purgeForMutation(cache, {
      query: "mutation UpdatePost($input: UpdateBlogPostInput!) { updateBlogPost { success } }",
      variables: { input: { slug: "foo" } },
    });

    expect(await getCached(cache, getPostsBody)).toBeUndefined();
  });

  it("input.slug に対応する GetPost キャッシュを無効化する", async () => {
    const cache = makeCache();
    await putCached(cache, getPostBody("foo"), 200, {}, '{"data":{}}');

    await purgeForMutation(cache, {
      query: "mutation UpdatePost { updateBlogPost { success } }",
      variables: { input: { slug: "foo" } },
    });

    expect(await getCached(cache, getPostBody("foo"))).toBeUndefined();
  });

  it("slug 変更時は newSlug 側も無効化する", async () => {
    const cache = makeCache();
    await putCached(cache, getPostBody("new-slug"), 200, {}, '{"data":{}}');

    await purgeForMutation(cache, {
      query: "mutation UpdatePost { updateBlogPost { success } }",
      variables: { input: { slug: "old-slug", newSlug: "new-slug" } },
    });

    expect(await getCached(cache, getPostBody("new-slug"))).toBeUndefined();
  });

  it("トップレベル slug（削除・アーカイブ）に対応するキャッシュを無効化する", async () => {
    const cache = makeCache();
    await putCached(cache, getPostBody("bar"), 200, {}, '{"data":{}}');

    await purgeForMutation(cache, {
      query: "mutation DeletePost($slug: String!) { deleteBlogPost { success } }",
      variables: { slug: "bar" },
    });

    expect(await getCached(cache, getPostBody("bar"))).toBeUndefined();
  });

  it("無関係な slug のキャッシュは残す", async () => {
    const cache = makeCache();
    await putCached(cache, getPostBody("keep"), 200, {}, '{"data":{}}');

    await purgeForMutation(cache, {
      query: "mutation DeletePost { deleteBlogPost { success } }",
      variables: { slug: "other" },
    });

    expect(await getCached(cache, getPostBody("keep"))).toBeDefined();
  });
});
