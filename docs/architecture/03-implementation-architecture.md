# 実装 Architecture

## 構成

```text
                         ┌── Astro SSR
                         │
                         ▼
                    Domain Programs
                         ▲
                         │
                    HTTP / GraphQL
                         ▲
                         │
                         API

Astro SSR
  ├── Routing / SSR / HTML Document
  ├── Static Content
  └── React Islands
          ├── Effect Adapter
          ├── React View
          └── Zustand vanilla store（必要な場合のみ）

Server Layers
  ├── D1
  ├── R2
  └── 外部 API
```

## Repository の責務

| 層                | 主な責務                                                                         |
| ----------------- | -------------------------------------------------------------------------------- |
| Domain            | Entity，Value，Use Case，Effect Program                                          |
| API               | HTTP / GraphQL Boundary，認証，入力 Decode，Domain Program の実行                |
| Web               | Astro Routing，SSR，Document，Island Boundary，Server-side Domain Program の実行 |
| Admin             | API / Domain の Consumer                                                         |
| Server Adapters   | D1，R2，外部 API の Effect Layer                                                 |
| `packages/parser` | Markdown の決定的な変換                                                          |
| `packages/ui`     | React Aria ベースの UI primitive                                                 |

## Server の処理

```text
Request
  ↓
Astro
  ↓
Domain Program
  ↓
Server Layer
  ├── D1
  ├── R2
  └── 外部 API
  ↓
Markdown / Domain Data
  ↓
Parser
  ↓
HTML Document
```

API は HTTP / GraphQL の inbound adapter である．Domain の所有者ではない．記事の正本は Markdown とし，Rendered HTML を Domain Representation にしない．

Web の SSR も，必要な場合は API を経由せず，Domain Program を Server Layer とともに直接実行できる．API と Web は，Domain Program に接続する並列の inbound adapter である．

## Client Island の処理

```text
Static HTML
  ↓ hydrate
React Island
  ↓
Effect Program
  ↓ Client Layer
HTTP / Browser API
  ↓
Result
  ├── Pending  → Suspense
  ├── Failure  → Error Boundary
  └── Success  → React View
```

Island は必要な箇所だけに限定する．静的な記事本文，見出し，Metadata は React Runtime を必要としない．

Client Island 内の外部作用は，処理の規模に関係なく Effect Program にする．単純な処理だけを `fetch` や `useEffect` に直接書く例外は設けない．

```text
External Effects → Effect
UI State         → React
Rendering        → React
Shared State     → Zustand
```

## Effect と React の Adapter

将来の Adapter は，概念的には次の型を持つ．

```ts
interface ReactM<P, E, R, A> {
  readonly priority: P;
  readonly effect: Effect.Effect<A, E, R>;
}
```

`ReactM` は Effect の代替ではない．担当するのは React の priority，Suspense Bridge，Transition 連携である．

Adapter は Resource の Identity を安定させる必要がある．`render` のたびに新しい Promise や Effect Fiber を無条件に生成しない．

## UI Package の境界

```text
React Aria primitives
          ↓
packages/ui
          ↓
@mimifuwacc/ui
          ↓
Application
```

shadcn はコード生成の起点として使い，生成されたコードは `packages/ui` で管理する．Application は `@mimifuwacc/ui` だけを import し，React Aria の primitive を直接 import しない．`packages/ui` は application-specific type と domain-specific type の両方を import してはならない．`UserId` のような domain primitive も対象に含む．Feature 層で UI 用の primitive または UI 専用 props に変換してから渡す．

## 実装順序

1. Markdown を記事の正本にする．
2. Parser / Renderer を API から分離する．
3. Astro SSR で記事を表示する．
4. Repository，Renderer，Cache を Effect Service にする．
5. 操作が必要な部分だけ React Island にする．
6. Island 間の共有が必要な場合だけ Zustand vanilla store を追加する．
7. React Aria ベースの `packages/ui` を整備する．
8. 必要になった時点で Effect と Suspense / Transition の Adapter を追加する．
