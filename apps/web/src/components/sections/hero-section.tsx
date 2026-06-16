import { Check, Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@mimifuwacc/ui/components/ui/avatar";
import { sessionId } from "@/lib/session-id";
import { useCopy } from "@/lib/use-copy";

export default function HeroSection() {
  const uuid = sessionId;
  const { copied, copy } = useCopy(uuid);

  return (
    <div className="sticky top-0 z-0 flex items-center justify-center px-6 sm:px-8 bg-muted/40">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mx-auto my-16">
        <div className="hidden sm:block">
          <Avatar className="w-32 h-32 border-4 border-background dark:border-foreground/20 shadow-2xl">
            <AvatarImage src="/mimifuwacc.png" alt="mimifuwacc" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </div>
        <div className="w-fit">
          <h1 className="text-left text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4 leading-tight">
            <span className="text-primary">mimifuwa.cc</span>
          </h1>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-2 text-sm text-muted-foreground font-mono cursor-pointer group"
          >
            {uuid}
            {copied ? (
              <Check className="size-3 text-primary shrink-0" />
            ) : (
              <Copy className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
