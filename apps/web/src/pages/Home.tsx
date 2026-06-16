import AboutSection from "@/components/sections/about-section";
import BlogsSection from "@/components/sections/blogs-section";
import HeroSection from "@/components/sections/hero-section";
import WorksSection from "@/components/sections/works-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* ヒーローを背面に固定し、この角丸シートが上にスクロールして覆う */}
      <div className="relative z-10 bg-background rounded-t-4xl shadow-[0_-10px_10px_rgba(0,0,0,0.025)]">
        {/* シートのつまみ */}
        <div className="absolute top-5 left-0 right-0">
          <div className="w-12 h-1.5 bg-border mx-auto rounded-full" />
        </div>
        <AboutSection />
        <WorksSection />
        <BlogsSection />
      </div>
    </>
  );
}
