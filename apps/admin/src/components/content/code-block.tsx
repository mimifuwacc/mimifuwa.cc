import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import type { El } from "./types";

/** コピー完了表示を元に戻すまでの時間（ミリ秒） */
const COPY_FEEDBACK_DURATION_MS = 2000;

export function CodeBlock(props: El) {
  const { children, ...rest } = props;
  const filename = rest["data-filename"] as string | undefined;
  const { "data-filename": _f, ...preProps } = rest;
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const text = preRef.current?.innerText ?? "";
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    });
  };

  const copyBtn = (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 text-xs transition-colors cursor-pointer"
      style={{ color: "var(--code-copy-color)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--code-copy-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--code-copy-color)";
      }}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      <span>{copied ? "Copied!" : "Copy"}</span>
    </button>
  );

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-border">
      {filename ? (
        <>
          <div
            className="flex items-center justify-between px-3 py-1.5 border-b border-border/60"
            style={{ backgroundColor: "var(--code-bg)" }}
          >
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "color-mix(in srgb, var(--code-copy-color) 15%, transparent)",
                color: "var(--code-copy-color)",
              }}
            >
              {filename}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">{copyBtn}</div>
          </div>
          <pre
            ref={preRef}
            className="overflow-x-auto p-5 text-sm leading-relaxed"
            style={{ backgroundColor: "var(--code-bg)" } as React.CSSProperties}
            {...(preProps as React.HTMLAttributes<HTMLPreElement>)}
          >
            {children}
          </pre>
        </>
      ) : (
        <>
          <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {copyBtn}
          </div>
          <pre
            ref={preRef}
            className="overflow-x-auto p-4 text-sm leading-relaxed"
            style={{ backgroundColor: "var(--code-bg)" } as React.CSSProperties}
            {...(preProps as React.HTMLAttributes<HTMLPreElement>)}
          >
            {children}
          </pre>
        </>
      )}
    </div>
  );
}
