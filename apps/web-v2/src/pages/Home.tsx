import HeroSection from "../components/sections/hero-section";
import AboutSection from "../components/sections/about-section";
import SkillsSection from "../components/sections/skills-section";
import WorksSection from "../components/sections/works-section";
import BlogsSection from "../components/sections/blogs-section";
import LinksSection from "../components/sections/links-section";

export default function Home() {
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
