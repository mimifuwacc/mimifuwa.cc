import { FaGithub } from "react-icons/fa";
import Button from "../button";
import Card from "../card";
import type { WorkItem } from "@contents/works";
import { works } from "@contents/works";
import { Section } from "../section";

function getGitHubOgImage(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  if (match) {
    const [, owner, repo] = match;
    return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
  }
  return "";
}

function WorkCard({ work }: { work: WorkItem }) {
  return (
    <Card
      className="group overflow-hidden hover:shadow-xl h-full flex flex-col !p-4 sm:p-6"
      href={work.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="relative overflow-hidden bg-slate-100 aspect-[1.91/1] !-m-4 sm:-mt-6">
        <img
          src={
            work.url.includes("github.com")
              ? getGitHubOgImage(work.url) || work.image || "/no-image.png"
              : work.image || "/no-image.png"
          }
          alt={work.title}
          className="w-full h-full object-cover"
          width={400}
          height={300}
        />
      </div>
      <div className="mt-8 sm:mt-10 px-2 mb-2 sm:mb-4 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-cyan-600 transition-colors">
          {work.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed flex-1">{work.description}</p>
      </div>
    </Card>
  );
}

export default function WorksSection() {
  return (
    <Section id="works-section" title="Works" subtitle="作成したアプリ・サービスなど">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
        {works.map((work) => (
          <WorkCard key={work.title} work={work} />
        ))}
      </div>
      <div className="text-center">
        <Button
          url="https://github.com/mimifuwacc"
          icon={<FaGithub />}
          className="mx-auto bg-slate-800 text-white hover:bg-slate-700"
        >
          <span className="hidden sm:inline">GitHubで他のプロジェクトを見る</span>
          <span className="sm:hidden">GitHub</span>
        </Button>
      </div>
    </Section>
  );
}
