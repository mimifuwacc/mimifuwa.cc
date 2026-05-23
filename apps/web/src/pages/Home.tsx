import AboutSection from "@/components/sections/about-section";
import BlogsSection from "@/components/sections/blogs-section";
import HeroSection from "@/components/sections/hero-section";
import WorksSection from "@/components/sections/works-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <WorksSection />
      <BlogsSection />
    </>
  );
}
