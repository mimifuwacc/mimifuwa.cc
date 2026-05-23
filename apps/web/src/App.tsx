import { fetchMeta, setMeta } from "haribote/client";
import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "react-router-dom";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { fetchAllPosts, fetchPostBySlug } from "@/lib/query/blog";
import { queryClient } from "@/lib/query/client";
import { ThemeProvider } from "@/lib/theme";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import Home from "@/pages/Home";
import Links from "@/pages/Links";

type ProgressState = "hidden" | "loading" | "done";

function NavigationProgress() {
  const navigation = useNavigation();
  const [state, setState] = useState<ProgressState>("hidden");

  useEffect(() => {
    if (navigation.state !== "idle") {
      setState("loading");
    } else if (state === "loading") {
      setState("done");
      const t = setTimeout(() => setState("hidden"), 400);
      return () => clearTimeout(t);
    }
  }, [navigation.state, state]);

  if (state === "hidden") return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[100] pointer-events-none">
      <div
        className="h-full bg-primary"
        style={
          state === "loading"
            ? { animation: "nav-progress 30s ease-out forwards" }
            : {
                width: "100%",
                opacity: 0,
                transition: "width 100ms, opacity 300ms 100ms",
              }
        }
      />
    </div>
  );
}

function MetaSync() {
  const location = useLocation();
  useEffect(() => {
    fetchMeta(location.pathname).then(setMeta);
  }, [location.pathname]);
  return null;
}

function Layout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-background">
      <ScrollRestoration />
      <NavigationProgress />
      <MetaSync />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/blogs",
        element: <BlogList />,
        loader: () =>
          queryClient.ensureQueryData({
            queryKey: ["posts"],
            queryFn: fetchAllPosts,
          }),
      },
      {
        path: "/blogs/*",
        element: <BlogPost />,
        loader: async ({ params }) => {
          const slug = params["*"] ?? "";
          try {
            return await queryClient.ensureQueryData({
              queryKey: ["post", slug],
              queryFn: () => fetchPostBySlug(slug),
            });
          } catch {
            return null;
          }
        },
      },
      { path: "/links", element: <Links /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
