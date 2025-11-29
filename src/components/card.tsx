import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const cardVariants = cva(
  "bg-white rounded-2xl shadow-md p-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        hover: "hover:shadow-lg hover:scale-[101%] sm:hover:scale-[102%]",
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
  href?: string;
  target?: string;
  rel?: string;
}

export default function Card({
  href,
  target,
  rel,
  children,
  className,
  variant,
  ...props
}: CardProps) {
  const cardClasses = cardVariants({
    variant: href ? "hover" : variant,
    className,
  });

  const content = (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  return content;
}
