import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const cardVariants = cva(
  "bg-white rounded-2xl shadow-lg p-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        hover: "hover:shadow-xl hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  url?: string;
}

export default function Card({
  url,
  children,
  className,
  ...props
}: CardProps) {
  const cardClasses = cardVariants({
    variant: url ? "hover" : "default",
    className,
  });

  const content = (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );

  if (url) {
    return <Link href={url}>{content}</Link>;
  }

  return content;
}
