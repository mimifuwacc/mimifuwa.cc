export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export const certifications = [
  { title: "情報処理安全確保支援士 (未登録)", date: "2025年度秋" },
  { title: "応用情報技術者", date: "2024年度秋" },
];

export const awards = [
  {
    date: "2023年8月",
    title: "U☆PoC～UECアイディア実証コンテスト～",
    description: "学際向けモバイルオーダーアプリで出展し，2つの企業賞を受賞しました",
  },
  {
    date: "2024年8月",
    title: "U☆PoC～UECアイディア実証コンテスト～",
    description:
      "電通大生向けサービス開発をきっかけとしたプロジェクトで出展し，3つの企業賞を受賞しました",
  },
];

export const timelineData: TimelineEvent[] = [
  {
    date: "2023年4月〜",
    title: "電気通信大学 I類 CS プログラム",
    description: "主にプログラミング言語・言語処理系について学んでいます",
  },
  {
    date: "2023年4月〜",
    title: "技術系学生団体 team411",
    description: "Web アプリケーションをチームで開発しています",
  },
  {
    date: "2024年11月〜2025年3月",
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
    date: "2026年1月〜",
    title: "株式会社はてな アルバイト",
    description: "学生アルバイトとして，Web 開発をメインに行っています",
  },
  {
    date: "2026年4月〜",
    title: "電気通信大学 佐藤研究室",
    description: "アセンブリ言語の形式意味論の構築に関する研究を行っています",
  },
];
