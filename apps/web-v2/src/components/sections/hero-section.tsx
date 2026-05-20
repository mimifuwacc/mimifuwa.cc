import { useCallback } from "react";
import { FaChevronDown } from "react-icons/fa";

function useSmoothScroll() {
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const headerHeight = 64;
    const yOffset = -headerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const targetY = window.pageYOffset + elementTop + yOffset;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, []);
  return { scrollToElement };
}

function Avatar() {
  return (
    <img
      src="https://github.com/mimifuwacc.png"
      alt="mimifuwacc"
      className="w-32 h-32 rounded-full border-4 border-white shadow-2xl hover:scale-110 transition-transform duration-500"
      width={144}
      height={144}
    />
  );
}

function Profile() {
  return (
    <div className="w-fit">
      <h1 className="text-left text-4xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-2 sm:mb-4 leading-tight">
        <span className="bg-cyan-600 bg-clip-text text-transparent">
          mimifuwacc
        </span>
      </h1>
      <p className="text-left text-sm text-slate-500 sm:text-base leading-relaxed">
        Web Developer / Frontend Engineer / UEC
      </p>
    </div>
  );
}

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center px-6 sm:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mx-auto my-16">
        <div className="hidden sm:block">
          <Avatar />
        </div>
        <Profile />
      </div>
    </div>
  );
}
