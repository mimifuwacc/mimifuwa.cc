import type { WorkItem } from "@contents/works";
import { ExternalLink } from "lucide-react";
import { Card } from "@mimifuwacc/ui/components/ui/card";

function getGitHubOgImage(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  if (match) return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`;
  return "";
}

export function WorkCard({ work }: { work: WorkItem }) {
  const imgSrc = work.image ?? getGitHubOgImage(work.url);

  return (
    <a href={work.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow duration-200">
        {imgSrc && (
          <img src={imgSrc} alt={work.title} className="w-full aspect-[1.91/1] object-cover" />
        )}
        <div className="px-4">
          <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors flex items-center gap-1.5">
            {work.title}
            <ExternalLink className="size-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{work.description}</p>
        </div>
      </Card>
    </a>
  );
}
