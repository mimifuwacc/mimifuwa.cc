import { allSkills } from "@contents/skills";
import { Section } from "../section";

function SkillCard({ name, image }: { name: string; image: string }) {
  return (
    <div className="group flex flex-col items-center">
      <img
        src={image}
        alt={name}
        width={48}
        height={48}
        className="w-[70%] transition-transform duration-300 group-hover:scale-125"
      />
    </div>
  );
}

export default function SkillsSection() {
  return (
    <Section id="skills-section" title="Skills & Tools" subtitle="使用している技術スタック">
      <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 sm:gap-4">
        {allSkills.map((skill) => (
          <SkillCard key={skill.name} name={skill.name} image={skill.image} />
        ))}
      </div>
    </Section>
  );
}
