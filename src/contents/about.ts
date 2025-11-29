export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export const certifications = [
  "応用情報技術者 (2024年度秋)",
  "ITパスポート (2020年度春)",
];

export const hobbies = [
  {
    name: "プログラミング",
  },
  {
    name: "Twitter",
  },
  {
    name: "音楽",
    items: [
      "ヰ世界情緒",
      "KAMITSUBAKI STUDIO",
      "SINSEKAI STUDIO",
      "ボーカロイド",
      "その他インターネットの音楽",
    ],
  },
  {
    name: "ライトノベル",
    items: ["スパイ教室", "こちまつ", "週クラ", "わたなれ"],
  },
];

export const timelineData: TimelineEvent[] = [
  {
    date: "2020年4月",
    title: "新宿山吹高校 情報科 入学",
  },
  {
    date: "2021年12月",
    title: "第31回山吹祭 実行委員会 技術担当",
    description:
      "公式サイトの作成、ストリーミング配信の実施やそこで使用するアプリケーションの開発などを行いました",
  },
  {
    date: "2023年4月",
    title: "電気通信大学 I類 入学",
  },
  {
    date: "2023年4月",
    title: "UEC Dashboard(現uBoard) リリース",
    description:
      "大学入学当初、情報が散在しており不便であったため自分用に開発し、一般にも公開しました",
  },
  {
    date: "2023年4月",
    title: "team411 入部",
    description:
      "「IT技術を通じて 大学と社会の課題を解決する」電通大の学生団体 team411 に入部しました",
  },
  {
    date: "2023年8月",
    title: "U☆PoC～UECアイディア実証コンテスト～2023",
    description:
      "2つのプロジェクトで出展し、ハートビーツ賞・たましん賞を受賞しました",
  },
  {
    date: "2024年8月",
    title: "U☆PoC～UECアイディア実証コンテスト～2024",
    description:
      "UEC Dashboardをきっかけとしたプロジェクトで出展し、コムサットジャパン賞・きらぼし賞・ハートビーツ賞を受賞しました",
  },
  {
    date: "2024年10月",
    title: "応用情報技術者試験 合格",
  },
  {
    date: "2024年11月",
    title: "第74回調布祭実行委員会 技術局",
    description: "調布祭公式サイトのデザイン・制作を担当しました",
  },
];
