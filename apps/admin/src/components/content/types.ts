// Markdown 由来の要素に渡る props（任意の属性を許容する）
export type El = {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};
