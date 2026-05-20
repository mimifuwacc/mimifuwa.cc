import { cva } from "class-variance-authority";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

const logoStyles = cva(
  "text-2xl font-bold text-cyan-600 hover:text-cyan-600/90 transition-all duration-200",
);

const navItemStyles = cva(
  "flex items-center rounded-xl font-medium transition-all duration-200",
  {
    variants: {
      isActive: {
        true: "bg-cyan-600 text-white",
        false: "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
      },
      size: {
        desktop: "gap-2 px-3 py-2 text-sm",
        mobile: "gap-3 px-3 py-2 text-base",
      },
    },
    defaultVariants: {
      isActive: false,
      size: "desktop",
    },
  },
);

function useMobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  return { isMenuOpen, toggleMenu, closeMenu };
}

const navItems: NavItem[] = [
  { href: "/", label: "ホーム" },
  { href: "/blogs", label: "ブログ" },
  { href: "/links", label: "相互リンク" },
];

function NavItemComponent({
  item,
  isActive,
  size = "desktop",
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  size?: "desktop" | "mobile";
  onClick?: () => void;
}) {
  return (
    <Link to={item.href} className={navItemStyles({ isActive, size })} onClick={onClick}>
      {item.label}
    </Link>
  );
}

function MobileMenuButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <span className="sr-only">{isOpen ? "メニューを閉じる" : "メニューを開く"}</span>
      <svg
        className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg
        className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function DesktopNavigation({ currentPath }: { currentPath: string }) {
  return (
    <nav className="hidden md:block" aria-label="メインナビゲーション">
      <ul className="flex items-baseline gap-2">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/" && currentPath.startsWith(item.href));
          return (
            <li key={item.href}>
              <NavItemComponent item={item} isActive={isActive} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileNavigation({
  currentPath,
  isOpen,
  onClose,
}: {
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="md:hidden" id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-slate-200">
        <nav aria-label="モバイルナビゲーション">
          <ul>
            {navItems.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));
              return (
                <li key={item.href}>
                  <NavItemComponent item={item} isActive={isActive} size="mobile" onClick={onClose} />
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileMenu();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className={logoStyles()}>mimifuwa.cc</Link>
          </div>
          <DesktopNavigation currentPath={currentPath} />
          <div className="md:hidden">
            <MobileMenuButton isOpen={isMenuOpen} onToggle={toggleMenu} />
          </div>
        </div>
        <MobileNavigation currentPath={currentPath} isOpen={isMenuOpen} onClose={closeMenu} />
      </div>
    </header>
  );
}
