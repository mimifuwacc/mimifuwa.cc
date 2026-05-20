import { links } from "@contents/links";
import { LinkToPage } from "../components/sections/links-section";
import { Section } from "../components/section";

export default function Links() {
  return (
    <div className="bg-slate-100">
      <Section id="links-page" title="Links" subtitle="知り合いのオタクのサイトたちです">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => (
            <LinkToPage key={`${link.name}-${index}`} link={link} />
          ))}
        </div>
      </Section>
    </div>
  );
}
