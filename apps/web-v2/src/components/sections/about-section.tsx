import { FaGithub, FaTwitter } from "react-icons/fa";
import { SiZenn } from "react-icons/si";
import Button from "../button";
import Card from "../card";
import { certifications, hobbies, timelineData } from "@contents/about";
import { Section } from "../section";

function Profile() {
  return (
    <Card className="p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-4">
        <img
          src="https://github.com/mimifuwacc.png"
          alt="mimifuwa"
          className="w-36 h-36 sm:w-28 sm:h-28 rounded-full border-4 border-slate-200 shadow-md flex-shrink-0 sm:mx-0 mx-auto"
          width={112}
          height={112}
        />
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-700">みみ</h3>
          <p className="text-slate-400 mb-2">@mimifuwacc</p>
          <p className="text-sm sm:text-base text-slate-500">
            電気通信大学 情報理工学域
            <br />
            CSプログラム
          </p>
        </div>
      </div>
      <p className="text-slate-600 mb-8 text-sm sm:text-base">
        フロントエンド開発を中心に、Web技術を使ってアプリケーションを開発しています。
        電気通信大学ベンチャー工房team411などに所属しています。
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-start">
        <Button
          url="https://github.com/mimifuwacc"
          variant="custom"
          size="sm"
          className="bg-slate-800 text-white hover:bg-slate-700 text-xs sm:text-sm"
          icon={<FaGithub />}
          text="GitHub"
        />
        <Button
          url="https://twitter.com/mimifuwacc"
          variant="custom"
          size="sm"
          className="bg-[#00acee] text-white hover:bg-[#00acee]/90 text-xs sm:text-sm"
          icon={<FaTwitter />}
          text="Twitter"
        />
        <Button
          url="https://zenn.dev/mimifuwacc"
          variant="custom"
          size="sm"
          className="bg-[#3ea8ff] text-white hover:bg-[#3ea8ff]/90 text-xs sm:text-sm"
          icon={<SiZenn />}
          text="Zenn"
        />
      </div>
    </Card>
  );
}

function Certifications() {
  return (
    <Card className="p-6 sm:p-10">
      <h4 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-6">Certifications</h4>
      <ul className="space-y-4 text-slate-600">
        {certifications.map((certification) => (
          <li key={certification} className="flex items-center gap-3 text-sm sm:text-base">
            <span className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0" />
            {certification}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Hobby() {
  return (
    <Card className="p-6 sm:p-10">
      <h4 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-6">Hobby</h4>
      <ul className="space-y-4 text-slate-600">
        {hobbies.map((hobby) => (
          <li key={hobby.name}>
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <span className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0" />
              {hobby.name}
            </div>
            <ul className="ml-8 mt-2 space-y-2 text-slate-500 text-sm sm:text-base">
              {hobby.items?.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Timeline() {
  return (
    <Card className="p-6 sm:p-10">
      <h4 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-8">Timeline</h4>
      <div className="relative pl-6">
        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-200" />
        <div className="space-y-8">
          {timelineData.map((event) => (
            <div key={`${event.date}-${event.title}`} className="relative">
              <div className="absolute -left-[29px] w-4 h-4 bg-cyan-600 rounded-full border-2 border-white shadow-md transform translate-x-1/2" />
              <div className="pl-2 -translate-y-1.5">
                <div className="mb-2">
                  <span className="text-xs font-medium text-cyan-600 border-cyan-600 border px-2 py-1 rounded-md inline-block">
                    {event.date}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-2">{event.title}</h4>
                {event.description && (
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
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
      <div className="absolute top-5 left-0 right-0 w-full">
        <div className="w-12 h-1.5 bg-slate-300 mx-auto rounded-full" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="space-y-4 sm:space-y-6">
          <Profile />
          <Certifications />
          <Hobby />
        </div>
        <Timeline />
      </div>
    </Section>
  );
}
