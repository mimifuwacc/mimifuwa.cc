import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

export function Section({ id, title, subtitle, className = "", children }: SectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="mb-12 px-2">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground/70 mb-2">{title}</h2>
            )}
            <div className="w-8 h-0.5 bg-primary mb-3" />
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
