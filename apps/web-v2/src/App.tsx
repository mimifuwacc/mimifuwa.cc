import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  Outlet,
  useLocation,
} from "react-router-dom";
import { fetchMeta, setMeta } from "haribote/client";
import { queryClient } from "@/lib/query/client";
import { fetchAllPosts, fetchPostBySlug } from "@/lib/query/blog";
import { ThemeProvider } from "@/lib/theme";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/pages/Home";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import Links from "@/pages/Links";

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
        loader: ({ params }) => {
          const slug = params["*"] ?? "";
          return queryClient.ensureQueryData({
            queryKey: ["post", slug],
            queryFn: () => fetchPostBySlug(slug),
          });
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
