import type { WorkItem } from "@contents/works";
import { works } from "@contents/works";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Card } from "@/components/ui/card";

function getGitHubOgImage(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  if (match) return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`;
  return "";
}

function WorkCard({ work }: { work: WorkItem }) {
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

export default function WorksSection() {
  return (
    <section id="works-section" className="py-12 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12 px-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground/70 mb-2">Works</h2>
          <div className="w-8 h-0.5 bg-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-3">作成したアプリ・サービスなど</p>
          <a
            href="https://github.com/mimifuwacc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm border border-border rounded-full px-3 py-1 text-muted-foreground"
          >
            <FaGithub className="size-3.5" />
            他のプロジェクトを見る
            <ArrowUpRight className="size-3" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {works.map((work) => (
            <WorkCard key={work.title} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}
