import type { Metadata } from "next";
import "./globals.css";

import { fonts } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "mimifuwa.cc",
  description: "mimifuwacc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={fonts?.map((font) => font.variable).join(" ")}>
        {children}
      </body>
    </html>
  );
}
