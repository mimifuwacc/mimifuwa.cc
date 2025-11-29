"use client";

import Image from "next/image";

import { allSkills } from "@/contents/skills";
import { Section } from "../section";

export const SkillCard = ({ name, image }: { name: string; image: string }) => (
  <div key={name} className="group flex flex-col items-center">
    <Image
      src={image}
      alt={name}
      width={48}
      height={48}
      className="w-[70%] transition-transform duration-300 group-hover:scale-120"
    />
  </div>
);

export default function SkillsSection() {
  return (
    <Section
      id="skills-section"
      title="Skills & Tools"
      subtitle="使用している技術スタック"
    >
      <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-16 gap-2 sm:gap-4">
        {allSkills.map((skill) => (
          <SkillCard key={skill.name} name={skill.name} image={skill.image} />
        ))}
      </div>
    </Section>
  );
}
