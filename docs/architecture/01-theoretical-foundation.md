# 理論的前提

参考: [「ReactはUI = f(State)であるか？」](https://wtrclred.io/ja/posts/09)

このプロジェクトで採用する要点は次のとおりである．

- React Component は，`Props -> UI` だけではなく，React Runtime が解釈する Program として扱う．
- Hooks，Suspense，Transition を含む React の処理は，計算，スケジューリング，Commit の複数段階に分けて考える．
- Server Rendering と Client Rendering は，共有可能な Program について，異なる環境・Effect Handler で解釈する関係として扱う．

$$ Program \xrightarrow{Interpret} Computation \xrightarrow{Schedule} Candidate \xrightarrow{Commit} UI $$

このモデルから，次の責務分担を採用する．

| 責務                              | 担当       |
| --------------------------------- | ---------- |
| Content                           | Markdown   |
| Computation                       | Effect     |
| Shared Mutable State              | Zustand    |
| Rendering と Scheduling           | React      |
| Accessibility と User Interaction | React Aria |
| Delivery と Composition Boundary  | Astro      |
| Visual Presentation               | CSS        |

この表以降は，出典記事の要約ではなく，このリポジトリの実装方針である．
