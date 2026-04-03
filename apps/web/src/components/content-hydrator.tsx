"use client";

import { useHydrateComponents } from "@/lib/hooks/use-hydrate-components";
import InfoCard from "./info-card";
import LinkCard from "./link-card";
import TwitterCard from "./twitter-card";

/**
 * ブログ記事内の data-component-type 属性を持つ要素を
 * 対応するReactコンポーネントにハイドレーションする
 */
export function ContentHydrator() {
  const componentMap = {
    "info-card": ({
      infoType,
      children,
    }: {
      infoType: string;
      children: string;
    }) => (
      <InfoCard type={infoType as "info" | "success" | "warning" | "dangerous"}>
        {children}
      </InfoCard>
    ),
    "link-card": ({ url }: { url: string }) => <LinkCard url={url} />,
    "twitter-card": ({ url }: { url: string }) => <TwitterCard url={url} />,
  };

  useHydrateComponents(componentMap);

  return null;
}
