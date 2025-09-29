import Image from "next/image";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { SiZenn } from "react-icons/si";
import Button from "@/components/button";
import Card from "@/components/card";

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

const qualifications = [
  "応用情報技術者 (2024年度秋)",
  "ITパスポート (2020年度春)",
  "実用数学技能検定 準1級",
  "全珠連 珠算検定 参段",
  "全珠連 暗算検定 準四段",
];

const musicInterests = [
  "KAMITSUBAKI STUDIO（V.W.P、ヰ世界情緒、CIEL、心世紀、罪十罰、梓川など...）",
  "ボカロ",
  "その他インターネットの音楽",
];

const novelInterests = [
  "こちら週末停滞委員会",
  "スパイ教室",
  "週に一度クラスメイトを買う話",
  "わたしが恋人になれるわけないじゃん、ムリムリ!（※ムリじゃなかった!?）",
];

const timelineData: TimelineEvent[] = [
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

const Timeline = () => {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-blue-200"></div>
      <div className="space-y-8">
        {timelineData.map((event) => (
          <div key={`${event.date}-${event.title}`} className="relative">
            <div className="absolute -left-[29px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md transform translate-x-1/2"></div>
            <div className="pl-2">
              <div className="mb-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                  {event.date}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                {event.title}
              </h4>
              {event.description && (
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function AboutSection() {
  return (
    <section id="about-section" className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            👋 About Me
          </h2>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            みみについて...
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Profile info */}
          <div className="space-y-8">
            <Card className="p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8">
                <Image
                  src="https://github.com/mimifuwacc.png"
                  alt="mimifuwa"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-blue-100 shadow-md flex-shrink-0"
                  width={112}
                  height={112}
                />
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                    みみ
                  </h3>
                  <p className="text-gray-600 mb-2 text-lg">
                    Kimimichi Shioiri
                  </p>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                    電気通信大学 情報理工学域
                    <br />
                    CSプログラム
                  </p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-base">
                フロントエンド開発を中心に、Web技術を使ってアプリケーションを開発しています。
                大学では学生団体team411で「IT技術を通じて
                大学と社会の課題を解決する」ことを目標にチームで活動しています。
              </p>

              {/* Social links */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-start">
                <Button
                  url="https://github.com/mimifuwa"
                  variant="custom"
                  size="sm"
                  className="bg-gray-800 text-white hover:bg-gray-700"
                  icon={<FaGithub />}
                  text="GitHub"
                />
                <Button
                  url="https://twitter.com/mimifuwa_dev"
                  variant="custom"
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  icon={<FaTwitter />}
                  text="Twitter"
                />
                <Button
                  url="https://zenn.dev/mimifuwa"
                  variant="custom"
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  icon={<SiZenn />}
                  text="Zenn"
                />
              </div>
            </Card>

            {/* Qualifications */}
            <Card className="p-6 sm:p-10">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex gap-3">
                <span>🏅</span>
                <span>資格・検定</span>
              </h4>
              <ul className="space-y-4 text-gray-600">
                {qualifications.map((qualification) => (
                  <li
                    key={qualification}
                    className="flex items-center gap-3 text-sm sm:text-base"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    {qualification}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Hobby */}
            <Card className="p-6 sm:p-10">
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex gap-3">
                <span>🎨</span>
                <span>趣味</span>
              </h4>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  音楽
                </li>
                <ul className="ml-8 mt-2 space-y-2 list-disc text-gray-500 text-sm sm:text-base">
                  {musicInterests.map((interest) => (
                    <li key={interest}>{interest}</li>
                  ))}
                </ul>
                <li className="flex items-center gap-3 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  ライトノベル
                </li>
                <ul className="ml-8 mt-2 space-y-2 list-disc text-gray-500 text-sm sm:text-base">
                  {novelInterests.map((novel) => (
                    <li key={novel}>{novel}</li>
                  ))}
                </ul>
              </ul>
            </Card>
          </div>

          {/* Right side - Timeline */}
          <Card className="p-6 sm:p-10">
            <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-8 flex gap-3">
              <span>📅</span>
              <span>活動記録</span>
            </h4>
            <Timeline />
          </Card>
        </div>
      </div>
    </section>
  );
}
