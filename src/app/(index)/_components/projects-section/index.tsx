"use client";

import Image from "next/image";
import { FaGithub } from "react-icons/fa";

import Button from "@/components/button";
import Card from "@/components/card";
import type { WorkItem } from "@/contents/works";
import { works } from "@/contents/works";
import { Section } from "../section";

// GitHubリポジトリのOG画像URLを生成
const getGitHubOgImage = (url: string): string => {
  const match = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
  if (match) {
    const [, owner, repo] = match;
    return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
  }
  return "";
};

export const ProjectCard = ({ work }: { work: WorkItem }) => (
  <Card
    className="group overflow-hidden hover:shadow-xl h-full flex flex-col"
    url={work.url}
  >
    {/* Project image */}
    <div className="relative overflow-hidden bg-gray-100 aspect-[1.91/1] -m-6">
      <Image
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

    {/* Project content */}
    <div className="mt-12 px-2 mb-4 flex-1 flex flex-col">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
        {work.title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
        {work.description}
      </p>
    </div>
  </Card>
);

export const GitHubLink = () => (
  <Button
    url={`https://github.com/mimifuwacc`}
    icon={<FaGithub />}
    className="mx-auto bg-gray-800 text-white hover:bg-gray-700"
  >
    <span className="hidden sm:inline">GitHubで他のプロジェクトを見る</span>
    <span className="sm:hidden">GitHub</span>
  </Button>
);

export default function ProjectsSection() {
  return (
    <Section
      id="projects-section"
      title="プロジェクト"
      subtitle="作成したアプリ・サービスなど"
      icon="🚀"
      bg="white"
    >
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
        {works.map((work) => (
          <ProjectCard key={work.title} work={work} />
        ))}
      </div>

      {/* View more projects */}
      <div className="text-center">
        <GitHubLink />
      </div>
    </Section>
  );
}
