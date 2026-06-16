// エディタ周りの定数（マジックナンバーの集約）。すべてミリ秒。

/** プレビュー反映のデバウンス時間 */
export const PREVIEW_DEBOUNCE_MS = 400;

/** 自動保存をトリガーするまでのアイドル時間 */
export const AUTOSAVE_IDLE_MS = 10_000;

/** 「自動保存しました」表示を消すまでの時間 */
export const AUTOSAVE_SAVED_RESET_MS = 3_000;

/** 入力中スナップショットを取るまでのデバウンス時間 */
export const SNAPSHOT_DEBOUNCE_MS = 500;

/** slug 重複チェックのデバウンス時間 */
export const SLUG_CHECK_DEBOUNCE_MS = 600;

/** undo/redo スタックの最大保持数 */
export const UNDO_STACK_LIMIT = 200;
