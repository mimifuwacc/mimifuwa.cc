import { links } from "@contents/links";
import { ExternalLink } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

export default function Links() {
  return (
    <Section id="links-page" title="Links" subtitle="知り合いのオタクのサイトたちです">
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="flex items-center justify-between gap-6">
                <div className="min-w-0 flex items-baseline gap-3">
                  <span className="font-medium group-hover:text-primary transition-colors shrink-0">
                    {link.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {new URL(link.url).hostname.replace("www.", "")}
                  </span>
                  <p className="text-sm text-muted-foreground truncate hidden sm:block">
                    {link.description}
                  </p>
                </div>
                <ExternalLink className="size-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </Section>
  );
}
