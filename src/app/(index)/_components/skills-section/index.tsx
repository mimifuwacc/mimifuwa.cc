"use client";

import Image from "next/image";
import Card from "@/components/card";
import { Section } from "../section";

const skills = {
  languages: [
    {
      name: "HTML",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
    },
    {
      name: "CSS",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
    },
    {
      name: "JavaScript",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    },
    {
      name: "TypeScript",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
    },
    {
      name: "Python",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    },
    {
      name: "C",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg",
    },
    {
      name: "C++",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
    },
    {
      name: "Ruby",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ruby/ruby-original.svg",
    },
    {
      name: "Rust",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg",
    },
  ],
  frameworks: [
    {
      name: "Node.js",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "React",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    },
    {
      name: "Next.js",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "Astro",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/astro/astro-original.svg",
    },
    {
      name: "Tailwind",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    },
    {
      name: "MUI",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/materialui/materialui-original.svg",
    },
    {
      name: "FastAPI",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
    },
  ],
  tools: [
    {
      name: "Linux",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg",
    },
    {
      name: "Git",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
    },
    {
      name: "GitHub",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
    },
    {
      name: "Docker",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
    },
    {
      name: "Cloudflare",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cloudflare/cloudflare-original.svg",
    },
    {
      name: "VSCode",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg",
    },
    {
      name: "Figma",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
    },
  ],
} as const;

const skillCategories = [
  { key: "languages", title: "Languages", emoji: "💻", color: "blue" },
  { key: "frameworks", title: "Frameworks", emoji: "⚡", color: "green" },
  { key: "tools", title: "Tools", emoji: "🛠️", color: "purple" },
] as const;

export const SkillItem = ({
  skill,
}: {
  skill: { name: string; image: string };
}) => (
  <div
    key={skill.name}
    className="group flex flex-col items-center p-3 pt-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
  >
    <div className="relative mb-3 sm:mb-4">
      <Image
        src={skill.image}
        alt={skill.name}
        width={48}
        height={48}
        className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-110"
      />
    </div>
    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
      {skill.name}
    </span>
  </div>
);

export const Category = ({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) => (
  <Card className="p-6 sm:p-10">
    <div className="flex items-center mb-4 sm:mb-6">
      <span className="text-2xl mr-3">{emoji}</span>
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">
        {title}
      </h3>
    </div>
    {children}
  </Card>
);

export default function SkillsSection() {
  return (
    <Section
      id="skills-section"
      title="スキル & ツール"
      subtitle="普段使っている技術スタック"
      icon="✨"
      bg="gray"
    >
      <div className="space-y-6">
        {skillCategories.map((category) => (
          <Category
            key={category.key}
            title={category.title}
            emoji={category.emoji}
          >
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
              {skills[category.key].map((skill) => (
                <SkillItem key={skill.name} skill={skill} />
              ))}
            </div>
          </Category>
        ))}
      </div>
    </Section>
  );
}
