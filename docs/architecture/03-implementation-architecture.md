# 実装 Architecture

## 構成

```mermaid
flowchart TD
  Astro[Astro SSR] --> Domain[Domain Programs]
  API[API] --> Domain
  Astro --> Routing[Routing / SSR / HTML Document]
  Astro --> Static[Static Content]
  Astro --> Islands[React Islands]
  Islands --> Adapter[Effect Adapter]
  Islands --> View[React View]
  Islands --> Store[Zustand vanilla store]
  Domain --> Layers[Server Layers]
  Layers --> D1
  Layers --> R2
  Layers --> External[External APIs]
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

```mermaid
flowchart TD
  Request --> Astro
  Astro --> Program[Domain Program]
  Program --> Layer[Server Layer]
  Layer --> D1
  Layer --> R2
  Layer --> External[External APIs]
  Layer --> Data[Markdown / Domain Data]
  Data --> Parser
  Parser --> HTML[HTML Document]
```

API は HTTP / GraphQL の inbound adapter である．Domain の所有者ではない．記事の正本は Markdown とし，Rendered HTML を Domain Representation にしない．

Web の SSR も，必要な場合は API を経由せず，Domain Program を Server Layer とともに直接実行できる．API と Web は，Domain Program に接続する並列の inbound adapter である．

## Client Island の処理

```mermaid
flowchart TD
  HTML[Static HTML] -->|Hydrate| Island[React Island]
  Island --> Program[Effect Program]
  Program --> Client[Client Layer]
  Client --> APIs[HTTP / Browser API]
  APIs --> Result
  Result -->|Pending| Suspense
  Result -->|Failure| Boundary[Error Boundary]
  Result -->|Success| View[React View]
```

Island は必要な箇所だけに限定する．静的な記事本文，見出し，Metadata は React Runtime を必要としない．

Client Island 内の外部作用は，処理の規模に関係なく Effect Program にする．単純な処理だけを `fetch` や `useEffect` に直接書く例外は設けない．

```mermaid
flowchart LR
  External[External Effects] --> Effect
  UIState[UI State] --> React
  Rendering --> React
  Shared[Shared State] --> Zustand
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

```mermaid
flowchart TD
  Aria[React Aria primitives] --> Package[packages/ui]
  Package --> API[@mimifuwacc/ui]
  API --> Application
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
