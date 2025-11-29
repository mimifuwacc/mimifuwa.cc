"use client";

import Image from "next/image";
import { FaChevronDown } from "react-icons/fa";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Background = () => (
  <div className="absolute inset-0 overflow-hidden" />
);

export const Avatar = () => (
  <Image
    src="https://github.com/mimifuwacc.png"
    alt="mimifuwacc"
    className="w-32 h-32 rounded-full border-6 border-white shadow-2xl hover:scale-110 transition-transform duration-500"
    width={144}
    height={144}
    priority
  />
);

export const Profile = () => {
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
};

export const ScrollIndicator = () => {
  const { scrollToElement } = useSmoothScroll();
  const scrollToContent = () => {
    scrollToElement("about-section");
  };

  return (
    <button
      type="button"
      onClick={scrollToContent}
      className="animate-bounce text-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
      aria-label="下にスクロール"
    >
      <FaChevronDown className="text-2xl sm:text-3xl" />
    </button>
  );
};

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
