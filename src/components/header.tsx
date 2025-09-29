"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { memo, useCallback, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { PiHouseBold } from "react-icons/pi";

export interface NavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface HeaderProps {
  path: string;
}

const logoStyles = cva(
  "text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200",
);

const navItemStyles = cva(
  "flex items-center rounded-lg font-medium transition-all duration-200",
  {
    variants: {
      isActive: {
        true: "bg-blue-100 text-blue-700 shadow-sm",
        false: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
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

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };
}

const navItems: NavItem[] = [
  { icon: <PiHouseBold />, href: "/", label: "ホーム" },
  { icon: <FaRegFileAlt />, href: "/blogs", label: "ブログ" },
];

const Logo = memo(function Logo() {
  return (
    <Link href="/" className={logoStyles()}>
      mimifuwa.cc
    </Link>
  );
});

const NavItemComponent = memo(function NavItemComponent({
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
  const iconSize = size === "desktop" ? "text-lg" : "text-xl";

  return (
    <Link
      href={item.href}
      className={navItemStyles({ isActive, size })}
      onClick={onClick}
    >
      <span className={iconSize}>{item.icon}</span>
      {item.label}
    </Link>
  );
});

const MobileMenuButton = memo(function MobileMenuButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <span className="sr-only">
        {isOpen ? "メニューを閉じる" : "メニューを開く"}
      </span>
      {/* ハンバーガーアイコン */}
      <svg
        className={`${
          isOpen ? "hidden" : "block"
        } h-6 w-6 transition-all duration-300`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      {/* 閉じるアイコン */}
      <svg
        className={`${
          isOpen ? "block" : "hidden"
        } h-6 w-6 transition-all duration-300`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
});

// デスクトップナビゲーションコンポーネント
const DesktopNavigation = memo(function DesktopNavigation({
  currentPath,
}: {
  currentPath: string;
}) {
  return (
    <nav className="hidden md:block" aria-label="メインナビゲーション">
      <ul className="ml-10 flex items-baseline space-x-4">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.href));

          return (
            <li key={item.href}>
              <NavItemComponent item={item} isActive={isActive} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

// モバイルナビゲーションコンポーネント
const MobileNavigation = memo(function MobileNavigation({
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
    <div
      className="md:hidden"
      id="mobile-menu"
      style={{
        animation: "slideDown 0.3s ease-out forwards",
      }}
    >
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
        <nav aria-label="モバイルナビゲーション">
          <ul>
            {navItems.map((item, index) => {
              const isActive =
                currentPath === item.href ||
                (item.href === "/blogs" && currentPath.startsWith("/blogs"));

              return (
                <li
                  key={item.href}
                  style={{
                    animation: `slideInLeft 0.3s ease-out ${
                      index * 0.1
                    }s forwards`,
                    opacity: 0,
                  }}
                >
                  <NavItemComponent
                    item={item}
                    isActive={isActive}
                    size="mobile"
                    onClick={onClose}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
});

// メインのヘッダーコンポーネント
const Header = memo(function Header({ path }: HeaderProps) {
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileMenu();

  return (
    <header
      className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200"
      style={{ zIndex: "var(--z-fixed)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* デスクトップナビゲーション */}
          <DesktopNavigation currentPath={path} />

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <MobileMenuButton isOpen={isMenuOpen} onToggle={toggleMenu} />
          </div>
        </div>

        {/* モバイルナビゲーション */}
        <MobileNavigation
          currentPath={path}
          isOpen={isMenuOpen}
          onClose={closeMenu}
        />
      </div>
    </header>
  );
});

export default Header;
