import { defineMiddleware } from "void";

export default defineMiddleware(async (c, next) => {
  c.set("headDefaults", {
    script: [
      {
        innerHTML: `
          const savedTheme = localStorage.getItem("theme");
          const dark = savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches);
          const root = document.documentElement;
          root.dataset.theme = dark ? "dark" : "light";
          root.style.backgroundColor = dark ? "#000000" : "#ffffff";
          root.style.color = dark ? "#ffffff" : "#000000";
          root.style.colorScheme = dark ? "dark" : "light";
          window.addEventListener("DOMContentLoaded", () => {
            document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#000000" : "#ffffff");
          });
        `,
      },
    ],
  });
  await next();
});
