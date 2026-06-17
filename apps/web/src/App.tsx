import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/layout";
import { fetchAllPosts, fetchPostBySlug } from "@/lib/query/blog";
import { queryClient } from "@/lib/query/client";
import { ThemeProvider } from "@/lib/theme";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import Home from "@/pages/Home";
import Links from "@/pages/Links";

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
