"use client";

import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import Button from "@/components/button";
import Card from "@/components/card";
import { Section } from "../section";

export const works = [
  {
    title: "uBoard",
    description:
      "電気通信大学の「ベンチャー工房」team411で開発している大学のWEBサービスやサイト、資料などを一箇所に集約した大学生向けサービスです。",
    url: "https://uboard.info",
    image: "/images/works/uboard.png",
  },
  {
    title: "team411 HP",
    description:
      "電気通信大学「ベンチャー工房」team411の公式サイトです。活動内容やプロジェクトの紹介など情報発信を行なっています。",
    url: "https://team411.net",
    image: "/images/works/team411.png",
  },
  {
    title: "74th Chofusai",
    description:
      "第74回調布祭公式サイトです。来場者向けに企画情報やマップ、タイムテーブルなどの情報を提供しました。",
    url: "https://74th.chofusai.jp",
    image: "/images/works/chofusai.png",
  },
  {
    title: "神椿市市民票ジェネレーター",
    description:
      "ゲーム「神椿市建設中。REGENERATE」の魔女の娘たちが持っている市民票を自分用にカスタマイズして生成できるツールです。",
    url: "https://kamitsubaki-cert.mimifuwa.cc",
    image: "/images/works/kamitsubaki-cert.png",
  },
  {
    title: "Enhanced NowPlaying",
    description:
      "NowPlayingのX(旧Twitter)への投稿をおしゃれにするツールです。ブラウザの拡張機能として動作します。",
    url: "https://github.com/mimifuwa/enhanced-nowplaying",
    image: "/images/works/enhanced-nowplaying.png",
  },
];

export const ProjectCard = ({
  work,
}: {
  work: { title: string; description: string; image: string; url: string };
}) => (
  <Card
    className="group overflow-hidden hover:shadow-xl h-full flex flex-col"
    url={work.url}
  >
    {/* Project image */}
    <div className="relative overflow-hidden bg-gray-100 aspect-[1.91/1] -m-6">
      <Image
        src={work.image}
        alt={work.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
