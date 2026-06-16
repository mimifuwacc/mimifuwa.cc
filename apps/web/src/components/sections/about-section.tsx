import { Section } from "../section";
import Certifications from "./about/certifications";
import Hobby from "./about/hobby";
import Profile from "./about/profile";
import Skills from "./about/skills";
import Timeline from "./about/timeline";

export default function AboutSection() {
  return (
    <Section
      id="about-section"
      title="About Me"
      subtitle="mimifuwacc について..."
      className="relative rounded-t-4xl shadow-[0_-10px_10px_rgba(0,0,0,0.025)]"
    >
      <div className="absolute top-5 left-0 right-0">
        <div className="w-12 h-1.5 bg-border mx-auto rounded-full" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="space-y-4">
          <Profile />
          <Certifications />
          <Skills />
          <Hobby />
        </div>
        <Timeline />
      </div>
    </Section>
  );
}
