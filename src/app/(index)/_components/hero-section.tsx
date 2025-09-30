"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaChevronDown, FaGithub, FaTwitter } from "react-icons/fa";
import { SiZenn } from "react-icons/si";
import Button from "@/components/button";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const roles = ["観測者", "改変者", "ENJP"];

export const Background = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute top-20 left-20 sm:top-40 sm:left-40 w-40 h-40 sm:w-80 sm:h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);

export const Avatar = () => (
  <Image
    src="https://github.com/mimifuwacc.png"
    alt="mimifuwacc"
    className="w-48 h-48 sm:w-48 sm:h-48 mx-auto rounded-full border-6 border-white shadow-2xl hover:scale-110 transition-transform duration-500"
    width={144}
    height={144}
  />
);

export const Profile = () => {
  const [currentRole, setCurrentRole] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentRole((prev) => (prev + 1) % roles.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-gray-800 mb-6 sm:mb-8 leading-tight">
        <span className="block sm:inline text-2xl sm:text-4xl lg:text-6xl">
          Welcome to
        </span>
        <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          mimifuwa.cc
        </span>
      </h1>

      <div className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-4 font-bold sm:mb-6 min-h-[2.5rem] sm:min-h-[3rem]">
        <span
          className={`inline-block transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {roles[currentRole]}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-10 sm:mb-16 sm:text-lg max-w-3xl mx-auto leading-relaxed">
        電気通信大学でコンピュータサイエンスを学びながら、
        <br />
        Webアプリケーションを中心に開発しています。
      </p>
    </>
  );
};

export const SocialLinks = () => (
  <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
    <Button
      icon={<FaGithub />}
      url="https://github.com/mimifuwacc"
      variant="custom"
      className="bg-gray-800 text-white hover:bg-gray-700"
    >
      <span className="hidden xs:inline sm:hidden lg:inline">GitHub</span>
    </Button>
    <Button
      icon={<FaTwitter />}
      url="https://twitter.com/mimifuwacc"
      variant="custom"
      className="bg-blue-500 text-white hover:bg-blue-600"
    >
      <span className="hidden xs:inline sm:hidden lg:inline">Twitter</span>
    </Button>
    <Button
      icon={<SiZenn />}
      url="https://zenn.dev/mimifuwacc"
      variant="custom"
      className="bg-blue-600 text-white hover:bg-blue-700"
    >
      <span className="hidden xs:inline sm:hidden lg:inline">Zenn</span>
    </Button>
    <Button
      url="/blogs"
      variant="custom"
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
    >
      <span>Blog</span>
    </Button>
  </div>
);

export const ScrollIndicator = () => {
  const { scrollToElement } = useSmoothScroll();
  const scrollToContent = () => {
    scrollToElement("about-section");
  };

  return (
    <button
      type="button"
      onClick={scrollToContent}
      className="animate-bounce text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      aria-label="下にスクロール"
    >
      <FaChevronDown className="text-2xl sm:text-3xl" />
    </button>
  );
};

export default function HeroSection() {
  return (
    <section className="flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-6 sm:px-8 py-10 sm:pt-20 sm:pb-10">
      {/* Background Animation */}
      <Background />
      <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
        <Avatar />
        <div className="mt-8 sm:mt-0">
          <Profile />
        </div>
        <div className="mb-12 sm:mb-20">
          <SocialLinks />
        </div>
        <ScrollIndicator />
      </div>
    </section>
  );
}
