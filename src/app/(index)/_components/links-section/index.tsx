"use client";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "@/components/button";
import Card from "@/components/card";
import type { LinkItem } from "@/contents/links";
import { links } from "@/contents/links";
import { Section } from "../section";

export const LinkToPage = ({ link }: { link: LinkItem }) => {
  return (
    <Card
      variant="hover"
      className="h-full group"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Link icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-700 group-hover:text-cyan-600 transition-colors truncate">
            {link.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span className="truncate">
              {new URL(link.url).hostname.replace("www.", "")}
            </span>
            <FaExternalLinkAlt className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">
        {link.description}
      </p>
    </Card>
  );
};

const ShowMore = () => (
  <Button url="/links" className="mx-auto">
    <span>もっと見る</span>
    <span>→</span>
  </Button>
);

export default function LinksSection() {
  const [randomLinks, setRandomLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    const shuffled = [...links].sort(() => Math.random() - 0.5);
    setRandomLinks(shuffled.slice(0, 6));
  }, []);

  return (
    <Section
      id="links-section"
      title="Links"
      subtitle="知り合いのオタクのサイトたちです"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {randomLinks.map((link, index) => (
          <LinkToPage key={`${link.name}-${index}`} link={link} />
        ))}
      </div>
      <ShowMore />
    </Section>
  );
}
