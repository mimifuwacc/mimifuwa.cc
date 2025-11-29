import type { Metadata } from "next";
import { links } from "@/contents/links";
import { LinkToPage } from "../(index)/_components/links-section";
import { Section } from "../(index)/_components/section";

export const metadata: Metadata = {
  title: "相互リンク - mimifuwa.cc",
  description: "知り合いのオタクのサイトたちです",
};

export default function LinksPage() {
  return (
    <div className="bg-slate-100">
      <Section
        id="links-page"
        title="Links"
        subtitle="知り合いのオタクのサイトたちです"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => (
            <LinkToPage key={`${link.name}-${index}`} link={link} />
          ))}
        </div>
      </Section>
    </div>
  );
}
