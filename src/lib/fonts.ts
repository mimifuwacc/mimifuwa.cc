import { Noto_Sans_JP, Source_Code_Pro } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

const sourceCodePro = Source_Code_Pro({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export const fonts = [notoSansJP, sourceCodePro];
