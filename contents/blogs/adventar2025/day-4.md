---
title: "VSCodeの拡張機能を作ってみた"
excerpt: "ハーフダチョウ研究会Advent Calendar 2025 4日目の記事です。"
date: 2025-12-10
tags: ["adventar2025", "技術"]
---

この記事は [ハーフダチョウ研究会Advent Calendar 2025](https://adventar.org/calendars/11432) の4日目の記事です。

昨日は [英語の授業を受けていたらSMCの勉強が始まった](https://mimifuwa.cc/blogs/adventar2025/day-3) でGenMCに少し触れてみた話をしました。

## つくったもの

こんにちは、みみです。今日はReactでのServer ComponentとClient Componentの境界を可視化するVSCode拡張機能を作った話をしようと思います。

早速ですが作ったものです。

https://github.com/mimifuwacc/rsc-boundary-marker

こんな感じのClient Componentがあるとします。

```tsx
"use client";

export default function Button() {
  return <button>Click me</button>;
}
```

このコンポーネントをサーバーサイドから呼ぶと、`'use client'` というマーカーが表示されButtonがClient Componentであることを示します。

```tsx
import Button from "./components/Button";

export default function Page() {
  return (
    <div>
      <Button /> 'use client'
    </div>
  );
}
```

## きっかけ

趣味のTwitter TLの巡回をしていたところ、こんなツイートを見つけました。
何も意識せずにServer ComponentからClient Componentを呼ぶとレスポンスサイズが大きくなってしまうことがあるが、それを防ぐために`"use client"`と明示されているコンポーネントを呼ぶときにマーカーがあったらいいなというやつです。

https://x.com/honey321998/status/1978473731770208304?s=20

ちょうど真剣にWeb(Next.js)を書き始めたこともあって、これあったら嬉しそうだなぁ〜となりました。そこでじゃあ作ってみるかとすぐ動けたのは今回の良かったポイントだと思います。

少し話がそれますが、私は8月に開催された「はてなサマーインターンシップ2025」に参加していて、そこでさまざまな社員の方々から「とりあえず思いついたものは作ってみなさい」と言われていたのが、今回の開発のモチベになったと思います。

はてなのインターンについては、別の記事で書いているほか、他社の(中長期)インターンにも参加しているので、インターンをしてみて得られたことみたいな記事も今後書こうと思っているので、乞うご期待。

https://mimifuwacc.hatenablog.com/entry/2025/09/05/165930

さらに、AIエージェントの存在も大きかったと思います。VSCodeの拡張機能を作るのが初めてだったので、LLMの力を借りられてとても助かりました。よく知っている分野だと自分で実装した方が早いとかありますが、知らない分野を開拓していくときのLLMの力は偉大です (あと今回は関係ないですが、大規模なめんどくさい作業をやる時とかも)。

## 実装

それでは早速実装を見ていきましょう。

### 環境を作る

まず、`yo` と `generator-code` を入れていきます。私はグローバルにnpmのツールを入れるときは `bun` を使うという謎のこだわりを持っているので、`bun` で入れました。

```bash
bun add -g yo generator-code
```

その後、

```bash
yo code
```

でVSCode拡張機能の雛形を作成します。これで開発環境は整いました。簡単ですね。

### エントリファイルを眺める

拡張機能のエントリファイルは `extension.ts` なので、これを少し眺めてみましょう。
まずパスですが、デフォルトは `src/extension.ts` です。トランスパイルされたものが `dist/extension.js` に入るので、`package.json` では

```json
"main": "./dist/extension.js",
```

と指定されています。まず、`activate` 関数ですが、これはVSCodeのActions Eventsが呼ばれた時に実行されます。ここで初期設定やイベントリスナーの追加などを行います。

https://code.visualstudio.com/api/references/activation-events

```ts
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // 初期設定やイベントリスナーの追加などをここで行う
}
```

また、対になるものとして `deactivate` 関数がありますが、これはVSCodeが終了するときに実行されます。今回は特に終了時にやることはないので、何も書きません。早速 `activate` の中身を見ていきます。

まず、Client Componentの横に表示するマーカーを定義しています。

```ts
const decorationType = vscode.window.createTextEditorDecorationType({
  after: {
    contentText: "'use client'",
    color: "rgba(153, 153, 153, 0.7)",
    margin: "0 0 0 1.5rem",
  },
});
```

次に、エディタ部分を取得し、マーカーを更新するための関数を用意します。マーカーを更新する関数 `updateDecorations` では、Client Componentをインポートしているかを `findClientCompoentUsage` でチェックして、使用されていた場合Client Componentの場所に先ほど定義した `decorationType` を適用するようになっています。

```ts
let activeEditor = vscode.window.activeTextEditor;

const updateDecorations = () => {
  if (!activeEditor) {
    return;
  }
  const ranges = findClientComponentUsages(activeEditor.document);
  activeEditor.setDecorations(decorationType, ranges);
};
```

最後に、アクティブなエディタが変更された時(`onDidChangeActiveTextEditor`) とテキストが編集されたとき(`onDidChangeTextDocument`) にマーカーをアップデートするように登録して完了です。

```ts
vscode.window.onDidChangeActiveTextEditor(
  (editor) => {
    activeEditor = editor;
    if (editor) {
      updateDecorations();
    }
  },
  null,
  context.subscriptions,
);

vscode.workspace.onDidChangeTextDocument(
  (event) => {
    if (activeEditor && event.document === activeEditor.document) {
      updateDecorations();
    }
  },
  null,
  context.subscriptions,
);

updateDecorations();
```

### `isUseClientDirective` を見る

まず、そのファイルがClient Componentであるかどうかを判断する関数 `isUseClientDirective` を見ていきます。Reactの公式ドキュメントによると、`'use client'` のディレクティブはファイルの先頭 (コメントは除く) に記述されるとあるので、その通りに実装しています。

https://react.dev/reference/rsc/use-client

まず、みんな大好きASTをパースして得ます。

```ts
const ast = parser.parse(content, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});
```

このASTについて、`DirectiveLiteral` かつ値が `'use client'` であるものを探し、あった場合 `true` を返します。ない場合は `false` が帰ってきます。

```ts
// Check for 'use client' directive
return ast.program.directives.some(
  (directive: any) =>
    directive.value.type === "DirectiveLiteral" && directive.value.value === "use client",
);
```

### `findClientComponentUsages` を見る

さて、Client Componentを使用しているかをチェックし、マーカーをおくべき場所を返す関数 `findClientComponentUsages` の中身を見ていきましょう。ここが拡張機能の本質です。

そもそもClient Component内でチェックする意味はありませんから、あらかじめ弾いておきます。

```ts
const content = document.getText();

if (isUseClientDirective(content)) {
  return [];
}
```

次に、みんな大好きASTをパースして得ておきます (2回目)。

```ts
const ast = parser.parse(document.getText(), {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});
```

以下このASTを探っていきます。まず、importされているコンポーネントを取得します。

```ts
const clientComponentImports: { localName: string; source: string }[] = [];
const usageRanges: vscode.Range[] = [];
const currentDir = path.dirname(document.uri.fsPath);

traverse(ast, {
  ImportDeclaration(nodePath) {
    const source = nodePath.node.source.value;

    const extensions = [".jsx", ".tsx"];
    const possiblePaths = extensions.flatMap((ext) => [
      path.resolve(currentDir, `${source}${ext}`),
      path.resolve(currentDir, `${source}/index${ext}`),
    ]);
...
```

こうすると、とりあえずimportされており、Client Componentの可能性があるコンポーネントたちが取得できます (`possiblePaths`)。そしてこれについて、Client Compoentかどうか調べればいいわけです。

```ts
for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");

      if (isUseClientDirective(fileContent)) {
        nodePath.node.specifiers.forEach((specifier) => {
          if (specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportSpecifier") {
            clientComponentImports.push({
              localName: specifier.local.name,
              source,
            });
          }
        });
        break;
      }
    } catch (error) {
      continue;
    }
  }
}
```

これによって `clientComponentImports` にこのファイルで使われているClient Componentが全て入りました。ここで、Client Componentが使われていない場合はお帰りいただきます。

```ts
if (clientComponentImports.length === 0) {
  return [];
}
```

それでは、最後にこのClient Componentが使われている場所のどこにマーカーを表示するべきかを判断していきます。

```tsx
<Component />

<Component></Component>

<Component>
</Component>
```

の3種類について考えなければいけなかったのでちょっと大変でした (AIが頑張ってくれた)。実装自体は愚直にやっているだけなので、そのまま貼るに留めます。

```ts
traverse(ast, {
  JSXElement(nodePath) {
    if (nodePath.node.openingElement.name.type === "JSXIdentifier") {
      const componentName = nodePath.node.openingElement.name.name;
      if (clientComponentImports.some((imp) => imp.localName === componentName)) {
        if (nodePath.node.closingElement) {
          // Check if opening and closing tags are on the same line
          const openingTagEnd = nodePath.node.openingElement.loc!.end;
          const closingTagStart = nodePath.node.closingElement.loc!.start;

          const range = (() => {
            if (openingTagEnd.line !== closingTagStart.line) {
              // If tags are on different lines, place after opening tag
              return new vscode.Range(
                new vscode.Position(openingTagEnd.line - 1, openingTagEnd.column),
                new vscode.Position(openingTagEnd.line - 1, openingTagEnd.column),
              );
            } else {
              // If tags are on the same line, place after closing tag
              const closingTagEnd = nodePath.node.closingElement.loc!.end;
              return new vscode.Range(
                new vscode.Position(closingTagEnd.line - 1, closingTagEnd.column),
                new vscode.Position(closingTagEnd.line - 1, closingTagEnd.column),
              );
            }
          })();

          usageRanges.push(range);
        } else {
          // Self-closing tag case
          const openingTagEnd = nodePath.node.openingElement.loc!.end;
          const range = new vscode.Range(
            new vscode.Position(openingTagEnd.line - 1, openingTagEnd.column),
            new vscode.Position(openingTagEnd.line - 1, openingTagEnd.column),
          );
          usageRanges.push(range);
        }
      }
    }
  },
});
```

これで、どこにマーカーを表示すればいいかを返すことができました！

```ts
return usageRanges;
```

## 作ってみて

完成したので、VSCode拡張機能のマーケットプレースに登録し、公開してみました (今見てみたら31ダウンロードされていた)。CI/CDだったり、Semantic Releaseなども組んでみましたが、うまくできている気がしないので手が空いたら修正しようと思っています (本当に？)。

https://marketplace.visualstudio.com/items?itemName=mimifuwacc.rsc-boundary-marker

Twitterに投稿もしました。

https://x.com/mimifuwacc/status/1979193609187659826?s=20

それなりの反響をいただいてとても嬉しかったです。GitHubのリポジトリで2桁スターをもらったのも初めてだったので、拡張機能が有用かどうかは置いておいて、良い経験になりました。

ドキュメントの文章などでサポートしてくださった [@honey32](https://x.com/honey321998) さんには感謝しかありません。

## 終わりに

というわけで、実装部分が少し長くなってしまいましたが、VSCode拡張を作ってみた話でした。
作ってみたいものがあったら、とにかく作ってみるというのはとても良いムーブだなと実感できました。皆さんもぜひ思い立ったら手を動かしてみてください！

明日は「Next16のServer Componentsと仲良くなる」話の予定です。
