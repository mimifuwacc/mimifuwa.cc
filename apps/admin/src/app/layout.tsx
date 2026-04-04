import type { Metadata } from "next";
import "./globals.css";
import "./preview.css";

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
    <html lang="ja">
      <body className="bg-slate-50">
        <div className="min-h-screen">
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold">Admin</h1>
              <nav className="flex gap-4">
                <a href="/" className="text-slate-600 hover:text-slate-900">Posts</a>
                <a href="/new" className="text-slate-600 hover:text-slate-900">New Post</a>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
