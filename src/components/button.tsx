import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const buttonVariants = cva(
  "flex items-center gap-2 sm:gap-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg font-medium cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        disabled:
          "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-green-500 text-white hover:bg-green-600",
        custom: "",
      },
      size: {
        default: "px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-6 py-4 text-xl",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed hover:scale-100",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      disabled: false,
    },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  text: string;
  url?: string;
}

export default function Button({
  icon,
  text,
  url,
  variant,
  size,
  disabled,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = !!disabled;
  const buttonClasses = buttonVariants({
    variant,
    size,
    disabled: isDisabled,
    className,
  });

  const content = (
    <>
      {icon && <span className="text-lg sm:text-xl">{icon}</span>}
      {text}
    </>
  );

  if (url) {
    return (
      <Link href={url} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClasses}
      {...props}
    >
      {content}
    </button>
  );
}
