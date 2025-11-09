"use client";

import Image from "next/image";

import Card from "@/components/card";
import { skills, skillCategories } from "@/contents/skills";
import { Section } from "../section";

export const SkillCard = ({ name, image }: { name: string; image: string }) => (
  <div
    key={name}
    className="group flex flex-col items-center p-3 pt-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
  >
    <div className="relative mb-3 sm:mb-4">
      <Image
        src={image}
        alt={name}
        width={48}
        height={48}
        className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-110"
      />
    </div>
    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">
      {name}
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
      <div className="space-y-8">
        {skillCategories.map((category) => (
          <Category
            key={category.key}
            title={category.title}
            emoji={category.emoji}
          >
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
              {skills[category.key].map((skill) => (
                <SkillCard
                  key={skill.name}
                  name={skill.name}
                  image={skill.image}
                />
              ))}
            </div>
          </Category>
        ))}
      </div>
    </Section>
  );
}
