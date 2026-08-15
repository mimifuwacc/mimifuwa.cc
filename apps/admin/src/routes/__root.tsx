import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../app/globals.css";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Admin | mimifuwa.cc" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="h-full flex flex-col bg-background">
            <header
              className="shrink-0 bg-card border-b border-border"
              style={{ height: "var(--header-h)" }}
            >
              <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
                <h1 className="text-base font-semibold text-foreground">mimifuwa.cc admin</h1>
                <nav className="flex gap-1">
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    Posts
                  </Link>
                  <Link
                    to="/new"
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    New Post
                  </Link>
                </nav>
              </div>
            </header>
            <main className="min-h-0 flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
