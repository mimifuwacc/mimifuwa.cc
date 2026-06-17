import { Outlet, ScrollRestoration } from "react-router-dom";
import Footer from "@/components/footer";
import Header from "@/components/header";
import MetaSync from "@/components/meta-sync";
import NavigationProgress from "@/components/navigation-progress";

export default function Layout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-background">
      <ScrollRestoration />
      <NavigationProgress />
      <MetaSync />
      <Header />
      <main className="min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
