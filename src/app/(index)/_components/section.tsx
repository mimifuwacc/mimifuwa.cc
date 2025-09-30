import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  bg?: "gray" | "white" | "custom";
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  title,
  subtitle,
  icon,
  bg = "gray",
  className = "",
  children,
}: SectionProps) {
  const bgClasses = {
    gray: "bg-gray-50",
    white: "bg-white",
    custom: "bg-gradient-to-r from-blue-50 to-indigo-50",
  };
  return (
    <section
      id={id}
      className={`${bgClasses[bg]} ${bg && "py-16 sm:py-24"} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12 sm:mb-16">
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3">
                {`${icon} ${title}`}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
