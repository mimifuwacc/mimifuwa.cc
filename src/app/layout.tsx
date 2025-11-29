import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { fonts } from "@/lib/fonts";

import "./globals.css";

const appName = "mimifuwa.cc";
const description = "mimifuwaccのポートフォリオサイト";

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
        url: "https://mimifuwa.cc/og.png",
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
    images: ["https://mimifuwa.cc/og.png"],
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
      <body className="text-slate-700 bg-slate-50 font-normal min-h-screen grid grid-rows-[auto_1fr_auto]">
        <GoogleAnalytics gaId="G-85K159T0NC" />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
