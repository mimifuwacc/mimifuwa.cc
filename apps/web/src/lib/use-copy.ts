import { useCallback, useState } from "react";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";

/** クリップボードへコピーし、一定時間だけ完了状態を返すフック */
export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  }, [text]);

  return { copied, copy };
}
