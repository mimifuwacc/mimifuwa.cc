import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { extractHeadings } from "@/lib/slugify";
import { cn } from "@/lib/utils";

interface Props {
  html: string;
  collapsible?: boolean;
}

export default function TableOfContents({ html, collapsible = false }: Props) {
  const headings = useMemo(() => extractHeadings(html), [html]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const onScroll = () => {
      const offset = 120; // header + margin
      let current = headings[0]?.id ?? "";
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  // アクティブ項目が変わったら TOC 内でスクロール追従
  useEffect(() => {
    if (!activeItemRef.current || !navRef.current || collapsible) return;
    const nav = navRef.current;
    const item = activeItemRef.current;
    const navTop = nav.scrollTop;
    const navBottom = navTop + nav.clientHeight;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    if (itemTop < navTop || itemBottom > navBottom) {
      nav.scrollTo({ top: itemTop - nav.clientHeight / 2, behavior: "smooth" });
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: activeId triggers re-run to read updated activeItemRef
  }, [activeId, collapsible]);

  if (headings.length === 0) return null;

  const list = (
    <ul className="space-y-1">
      {headings.map(({ id, text, level }) => {
        const isActive = activeId === id;
        return (
          <li key={id}>
            <a
              ref={isActive ? activeItemRef : null}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveId(id);
                if (collapsible) setOpen(false);
              }}
              className={cn(
                "block text-sm leading-snug transition-colors hover:text-foreground py-0.5",
                level === 3 && "pl-3",
                isActive ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              {text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (collapsible) {
    return (
      <Card className="mb-8 !py-0 !gap-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
        >
          目次
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && <div className="px-4 pb-4 border-t pt-3">{list}</div>}
      </Card>
    );
  }

  return (
    <Card className="sticky top-20 !py-0">
      <div ref={navRef} className="relative px-4 py-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          目次
        </p>
        {list}
      </div>
    </Card>
  );
}
