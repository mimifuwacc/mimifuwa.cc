import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Admin | mimifuwa.cc",
  description: "Blog management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full overflow-hidden">
      <body className="h-full overflow-hidden">
        <Providers>
          <Toaster position="bottom-right" richColors />
          <div className="h-full flex flex-col bg-background">
            <header
              className="shrink-0 bg-card border-b border-border"
              style={{ height: "var(--header-h)" }}
            >
              <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
                <h1 className="text-base font-semibold text-foreground">mimifuwa.cc admin</h1>
                <nav className="flex gap-1">
                  <a
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    Posts
                  </a>
                  <a
                    href="/new"
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    New Post
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
