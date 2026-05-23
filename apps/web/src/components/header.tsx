import { Menu, Moon, Sun, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/lib/theme";
import { cn } from "@mimifuwacc/ui/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blog" },
  { href: "/links", label: "Links" },
];

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link
            viewTransition
            to="/"
            className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors"
          >
            mimifuwa.cc
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));
              return (
                <Link
                  viewTransition
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm transition-colors",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* モバイルナビ */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "text-sm px-2 py-1.5 rounded-md transition-colors",
                    isActive
                      ? "text-foreground font-medium bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
