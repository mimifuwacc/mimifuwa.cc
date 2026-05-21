import { certifications, hobbies, timelineData } from "@contents/about";
import { allSkills } from "@contents/skills";
import { Award, BadgeCheck, ChevronRight, Clock, Smile, Wrench } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { SiZenn } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Section } from "../section";

function Profile() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-muted shrink-0">
            <AvatarImage src="https://github.com/mimifuwacc.png" alt="mimifuwa" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold leading-tight">みみ</h3>
            <p className="text-sm text-muted-foreground">@mimifuwacc</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              電気通信大学 情報理工学域 CSプログラム
            </p>
          </div>
        </div>
        <Separator className="mb-4" />
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          フロントエンド開発を中心に、Web技術を使ってアプリケーションを開発しています。
          電気通信大学ベンチャー工房team411などに所属しています。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            render={
              <a
                href="https://github.com/mimifuwacc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              />
            }
          >
            <FaGithub /> GitHub
          </Button>
          <Button
            size="sm"
            variant="secondary"
            render={
              <a
                href="https://twitter.com/mimifuwacc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              />
            }
          >
            <FaTwitter /> Twitter
          </Button>
          <Button
            size="sm"
            variant="secondary"
            render={
              <a
                href="https://zenn.dev/mimifuwacc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zenn"
              />
            }
          >
            <SiZenn /> Zenn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Skills() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Wrench className="size-4 text-primary" />
          Skills
        </h3>
        <div className="h-px bg-border mb-4" />
        <div className="grid grid-cols-8 gap-3">
          {allSkills.map((skill) => (
            <div
              key={skill.name}
              className="group flex items-center justify-center"
              title={skill.name}
            >
              <img src={skill.image} alt={skill.name} className="w-full max-w-[28px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Certifications() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Award className="size-4 text-primary" />
          Certifications
        </h3>
        <div className="h-px bg-border mb-4" />
        <div className="space-y-2">
          {certifications.map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm">
              <BadgeCheck className="size-4 text-primary shrink-0" />
              {c}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Hobby() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Smile className="size-4 text-primary" />
          Hobby
        </h3>
        <div className="h-px bg-border mb-4" />
        <div className="space-y-3">
          {hobbies.map((h) => (
            <div key={h.name} className="space-y-2">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <ChevronRight className="size-3 text-primary shrink-0" />
                {h.name}
              </span>
              {h.items && (
                <div className="flex flex-wrap gap-1.5">
                  {h.items.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Timeline() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          Timeline
        </h3>
        <div className="h-px bg-border mb-5" />
        {/* ドット中心 = left-[5.5px]（11px幅の半分）、ラインも left-[5.5px] で一致 */}
        <div className="relative">
          <div className="absolute left-[5.5px] top-0 bottom-0 w-px bg-border" />
          <svg
            className="absolute bottom-0 left-0 w-3 text-border"
            viewBox="0 0 12 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 0 L6 6 L12 0"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {timelineData.map((event) => (
            <div key={`${event.date}-${event.title}`} className="relative pl-6 pb-7 last:pb-8">
              <div className="absolute left-0 top-[3px] w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20" />
              <Badge
                variant="outline"
                className="mb-1.5 text-xs text-primary border-primary/40 bg-primary/5"
              >
                {event.date}
              </Badge>
              <h4 className="text-sm font-semibold leading-snug mb-1">{event.title}</h4>
              {event.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AboutSection() {
  return (
    <Section
      id="about-section"
      title="About Me"
      subtitle="みみについて..."
      className="relative rounded-t-4xl shadow-[0_-10px_10px_rgba(0,0,0,0.025)]"
    >
      <div className="absolute top-5 left-0 right-0">
        <div className="w-12 h-1.5 bg-border mx-auto rounded-full" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="space-y-4">
          <Profile />
          <Certifications />
          <Skills />
          <Hobby />
        </div>
        <Timeline />
      </div>
    </Section>
  );
}
