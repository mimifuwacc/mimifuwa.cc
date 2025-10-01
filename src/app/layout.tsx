// import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";

// import Footer from "@/components/footer";
import Header from "@/components/header";
import { fonts } from "@/lib/fonts";

import "./globals.css";

const appName = "mimifuwa.cc";
const description = "Kimimichi Shioiriのポートフォリオサイト";

export const metadata: Metadata = {
  title: {
    template: `%s - ${appName}`,
    default: appName,
  },
  description,

  openGraph: {
    title: appName,
    description,
    url: process.env.BASE_URL,
    siteName: appName,
    images: [
      {
        url: "https://mimifuwa.cc/ogp.png",
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description,
    images: ["https://mimifuwa.cc/ogp.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${fonts.map((font) => font.variable).join(" ")}`}
    >
      <body className="text-slate-700 font-normal">
        <Header />
        <main>{children}</main>
        {/* <GoogleAnalytics gaId="G-85K159T0NC" /> */}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
