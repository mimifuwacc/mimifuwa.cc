import { createApp } from "vue";
import "../styles/mimifuwa-cc.css";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import HomePage from "./pages/HomePage.vue";
import BlogArticlePage from "./pages/BlogArticlePage.vue";
import BlogListPage from "./pages/BlogListPage.vue";
import MutualsPage from "./pages/MutualsPage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";
import OnRepeatPage from "./pages/OnRepeatPage.vue";
import WorksPage from "./pages/WorksPage.vue";
import WorkDetailPage from "./pages/WorkDetailPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/blogs/", component: BlogListPage },
    { path: "/blogs/:pathMatch(.*)*", component: BlogArticlePage },
    { path: "/works/", component: WorksPage },
    { path: "/works/:slug+", component: WorkDetailPage },
    { path: "/onrepeat/", component: OnRepeatPage },
    { path: "/on-repeat/", redirect: "/onrepeat/" },
    { path: "/mutuals/", component: MutualsPage },
    { path: "/links", redirect: "/mutuals/" },
    { path: "/:pathMatch(.*)*", component: NotFoundPage },
  ],
});

createApp(App).use(router).mount("#app");
