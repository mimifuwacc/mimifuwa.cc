export interface WorkItem {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export const works: WorkItem[] = [
  {
    title: "mimifuwa.cc",
    description:
      "このサイトです．フロントエンドは React Router + haribote で，ブログ配信 API に hono，管理画面に Next.js を使用しています．",
    url: "https://mimifuwa.cc",
    image: "https://mimifuwa.cc/og.png",
  },
  {
    title: "uBoard",
    description:
      "電気通信大学の「ベンチャー工房」team411で開発している大学のWEBサービスやサイト，資料などを一箇所に集約した大学生向けサービスです．",
    url: "https://uboard.info",
    image: "/images/works/uboard.png",
  },
  {
    title: "team411 HP",
    description:
      "電気通信大学「ベンチャー工房」team411の公式サイトです．活動内容やプロジェクトの紹介など情報発信を行なっています．",
    url: "https://team411.net",
    image: "/images/works/team411.png",
  },
  {
    title: "74th Chofusai",
    description:
      "第74回調布祭公式サイトです．来場者向けに企画情報やマップ，タイムテーブルなどの情報を提供しました．",
    url: "https://74th.chofusai.jp",
    image: "/images/works/chofusai.png",
  },
  {
    title: "MO",
    description:
      "team411で開発している学祭向けの汎用モバイルオーダーシステムです．第75回調布祭に向けてた開発で，主にフロントエンド開発に携わりました．",
    url: "https://team411.net/projects/mo/",
    image: "/images/works/mo.png",
  },
  {
    title: "NowPlaying",
    description:
      "NowPlaying の Twitter への投稿をおしゃれにするツールです．ブラウザの拡張機能として動作します．",
    url: "https://github.com/mimifuwacc/nowplaying",
  },
  {
    title: "RSC Boundary Marker",
    description:
      "ReactでServer ComponentsとClient Componentsの境界を視覚的に確認するためのVSCode拡張機能．",
    url: "https://github.com/mimifuwacc/rsc-boundary-marker",
  },
  {
    title: "haribote",
    description: "metadata だけを SSR する Vite プラグインです．このサイトでも使用しています．",
    url: "https://github.com/mimifuwacc/haribote",
  },
];
