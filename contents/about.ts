export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export const certifications = [
  "情報処理安全確保支援士 (未登録) (2025年度秋)",
  "応用情報技術者 (2024年度秋)",
  "ITパスポート (2020年度春)",
];

export const hobbies = [
  {
    name: "開発",
    items: ["Web", "dotfiles", "UUID"],
  },
  {
    name: "音楽",
    items: ["ヰ世界情緒", "花譜", "V.W.P", "VALIS", "少女革命計画", "KMNZ"],
  },
  {
    name: "ライトノベル",
    items: ["スパイ教室", "こちら週末停滞委員会", "わたなれ"],
  },
  {
    name: "Twitter",
  },
  {
    name: "ラーメン二郎",
  },
];

export const timelineData: TimelineEvent[] = [
  {
    date: "2023年4月",
    title: "電気通信大学 I類 入学",
  },
  {
    date: "2023年8月",
    title: "U☆PoC～UECアイディア実証コンテスト～2023",
    description: "学際向けモバイルオーダーアプリなどで出展し，2つの企業賞を受賞しました",
  },
  {
    date: "2024年8月",
    title: "U☆PoC～UECアイディア実証コンテスト～2024",
    description:
      "電通大生向けサービス開発をきっかけとしたプロジェクトで出展し，3つの企業賞を受賞しました",
  },
  {
    date: "2024年11月",
    title: "第74回調布祭実行委員会 技術局",
    description: "調布祭公式サイトのデザイン・制作を担当しました",
  },
  {
    date: "2025年8月",
    title: "はてなサマーインターンシップ 2025",
    description: "ノベルチームでカクヨムにパスキーログイン機能を実装しました",
  },
  {
    date: "2025年10〜12月",
    title: "ドワンゴ長期インターンシップ",
    description: "教育事業本部でフロントエンド開発を行いました",
  },
  {
    date: "2025年12月",
    title: "情報処理安全確保支援士試験 合格",
  },
  {
    date: "2026年1月",
    title: "はてな アルバイト",
  },
  {
    date: "2026年4月",
    title: "PLSP Lab",
    description: "電気通信大学の佐藤研究室に所属し，卒業研究を行っています",
  },
];
