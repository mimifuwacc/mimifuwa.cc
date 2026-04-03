import AboutSection from "./_components/about-section";
import BlogsSection from "./_components/blogs-section";
import HeroSection from "./_components/hero-section";
import LinksSection from "./_components/links-section";
import SkillsSection from "./_components/skills-section";
import WorksSection from "./_components/works-section";

export default function Page() {
  return (
    <div className="bg-slate-100">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <WorksSection />
      <BlogsSection />
      <LinksSection />
    </div>
  );
}
