import AboutSection from "./_components/about-section";
import BlogsSection from "./_components/blogs-section";
import HeroSection from "./_components/hero-section";
import ProjectsSection from "./_components/projects-section";
import SkillsSection from "./_components/skills-section";

export default function Page() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <BlogsSection />
    </>
  );
}
