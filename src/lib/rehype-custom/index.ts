import type { Root } from "hast";
import type { HTMLAttributes, ReactNode } from "react";
import rehypeInfoCard from "./rehype-info-card";
import rehypeLinkCard from "./rehype-link-card";

export const rehypeCustom = () => {
  const infoCardPlugin = rehypeInfoCard();
  const linkCardPlugin = rehypeLinkCard();

  return (tree: Root) => {
    infoCardPlugin(tree);
    linkCardPlugin(tree);
  };
};

export const DATA_ATTRS = {
  componentType: "data-component-type",
  url: "data-url",
  infoType: "data-info-type",
} as const;

export type DataAttrKey = (typeof DATA_ATTRS)[keyof typeof DATA_ATTRS];

export type ComponentData = {
  [K in (typeof DATA_ATTRS)[keyof typeof DATA_ATTRS]]?: string;
};

export type ComponentProps = HTMLAttributes<HTMLDivElement> & ComponentData;

export type RestProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  keyof ComponentData
>;

export const extractComponentProps = (
  props: HTMLAttributes<HTMLDivElement> & ComponentData,
): [ComponentData, RestProps, ReactNode?] => {
  const { children, ...restProps } = props;

  const componentData = Object.values(DATA_ATTRS).reduce((acc, dataAttrKey) => {
    if (dataAttrKey in props) {
      acc[dataAttrKey] = props[dataAttrKey as keyof ComponentData] as string;
    }
    return acc;
  }, {} as ComponentData);

  return [componentData, restProps as RestProps, children];
};
