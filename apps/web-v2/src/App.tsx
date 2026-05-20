import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { fetchMeta, setMeta } from "haribote/client";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import Links from "./pages/Links";

function MetaSync() {
  const location = useLocation();
  useEffect(() => {
    fetchMeta(location.pathname).then(setMeta);
  }, [location.pathname]);
  return null;
}

function Layout() {
  return (
    <div className="text-slate-700 bg-slate-50 min-h-screen grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/*" element={<BlogPost />} />
          <Route path="/links" element={<Links />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MetaSync />
      <Layout />
    </BrowserRouter>
  );
}
