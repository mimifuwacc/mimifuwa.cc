import { Section } from "../section";
import Certifications from "./about/certifications";
import Hobby from "./about/hobby";
import Profile from "./about/profile";
import Skills from "./about/skills";
import Timeline from "./about/timeline";

export default function AboutSection() {
  return (
    <Section id="about-section" title="About Me" subtitle="mimifuwacc について...">
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
