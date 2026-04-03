# Git コミットルール

## コミットメッセージの形式

1. 一行で簡潔に書くこと
2. 体言止めで書くこと
3. Conventional Commits の形式に従うこと
   - `feat:` 新機能
   - `fix:` バグ修正
   - `refactor:` リファクタリング
   - `docs:` ドキュメント
   - `chore:` ビルド・設定など
   - `test:` テスト関連
   - `ci:` CI関連

4. Monorepo　の場合は scope を明記すること
   - `feat(api):`，`fix(web):` など

## コミットの粒度

コミットは仕様記述の一形態であることを意識する

良い例:

- `feat(api): 記事一覧取得APIの実装`
- `refactor(api): entity->model変換をmapping.goに分離`

悪い例:

- `いろいろ修正` ← 何をしたか不明
- `refactorと機能追加` ← 異なる目的が混在
