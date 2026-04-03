import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  title,
  subtitle,
  className = "",
  children,
}: SectionProps) {
  return (
    <section id={id} className={`bg-slate-50 py-12 sm:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="mb-12 sm:mb-16 text-left px-2">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-400 mb-2 gap-3">
                {`${title}`}
              </h2>
            )}
            {subtitle && (
              <p className="text-slate-500 text-base sm:text-lg max-w-2xl">
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
