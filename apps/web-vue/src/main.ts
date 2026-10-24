import { createApp } from "vue";
import "../styles/mimifuwa-cc.css";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import HomePage from "./pages/HomePage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/:pathMatch(.*)*", component: NotFoundPage },
  ],
});

createApp(App).use(router).mount("#app");
