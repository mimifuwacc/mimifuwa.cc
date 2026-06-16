import { works } from "@contents/works";
import { ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { WorkCard } from "./work-card";

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
