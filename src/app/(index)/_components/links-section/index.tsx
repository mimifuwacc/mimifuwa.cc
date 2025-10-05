"use client";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "@/components/button";
import Card from "@/components/card";
import { Section } from "../section";

interface LinkItem {
  name: string;
  url: string;
  description: string;
  image?: string;
}

const links: LinkItem[] = [
  {
    name: "e_chan1007",
    url: "https://e-chan.me",
    description: "てるてる坊主の人。最近サイトが更新されてモダンになった。",
  },
  {
    name: "kanaru.me",
    url: "https://kanaru.me",
    description: "リロードしないとまともに表示されないサイト。早く直して",
  },
  {
    name: "Keita Ito",
    url: "https://keitaito.net",
    description: "本名はえぐちじゃないらしい",
  },
  {
    name: "Syougo Matsunaga",
    url: "https://portfolio.akaaku.net/",
    description: "令和最新版デザイン。ブログシステム待ってます。",
  },
  {
    name: "SHINNの研究室",
    url: "https://shinn-chan.net/",
    description: "電通大の数学徒。記事書いてね〜",
  },
  {
    name: "かとうのHomePage",
    url: "https://kat0h.com/",
    description: "古き良きデザイン。更新待ってます。",
  },
  {
    name: "はんかくくんのページ",
    url: "https://kqiita.github.io/",
    description: "きーたちゃん♡",
  },
  {
    name: "TABI.PROJECT",
    url: "https://tabitostudio.github.io/",
    description: "ロボット作ってる強い人。",
  },
  {
    name: "ゆいのページ",
    url: "https://yuino.dev/",
    description: "ゆいのフレームワークを早く公開してください。",
  },
  {
    name: "へる破壊財団",
    url: "https://helkun.dev/",
    description: "へるーれっとにお世話になっております。",
  },
  {
    name: "あづみのメモ帳",
    url: "https://azumino.pages.dev/",
    description: "一生工事中らしいです。",
  },
  {
    name: "すしのへや",
    url: "https://sushichan.live/",
    description: "技術強すぎ人類。",
  },
  {
    name: "エリンギ@McbeEringi",
    url: "https://mcbeeringi.github.io/",
    description: "Arch Linuxは最高だよね。",
  },
  {
    name: "y-chan's website",
    url: "https://y-chan.dev/",
    description: "可愛いエンジニア。",
  },
];

export const LinkToPage = ({ link }: { link: LinkItem }) => {
  return (
    <Card variant="hover" className="h-full group" url={link.url}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
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
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {link.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className="truncate">
              {new URL(link.url).hostname.replace("www.", "")}
            </span>
            <FaExternalLinkAlt className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed">{link.description}</p>
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
      title="相互リンク"
      subtitle="知り合いのオタクのサイトたちです"
      icon="🔗"
      bg="gray"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {randomLinks.map((link, index) => (
          <LinkToPage key={`${link.name}-${index}`} link={link} />
        ))}
      </div>
      <ShowMore />
    </Section>
  );
}
