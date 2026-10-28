import { defineMiddleware } from "void";

export default defineMiddleware(async (c, next) => {
  c.set("headDefaults", {
    script: [
      {
        innerHTML: `
          const navigation = performance.getEntriesByType("navigation")[0];
          if (navigation?.type === "reload") {
            const key = history.state?.__voidScrollKey;
            try {
              const position = JSON.parse(sessionStorage.getItem("void:scroll:" + key) || "null");
              if (Number.isFinite(position?.x) && Number.isFinite(position?.y) && position.y > 0) {
                const root = document.documentElement;
                history.scrollRestoration = "manual";
                root.style.visibility = "hidden";
                if (position.y > 480) {
                  root.dataset.restoredScroll = "past-rail-threshold";
                }

                let previousHeight = 0;
                let stableFrames = 0;
                let frames = 0;
                const restoreScroll = () => {
                  const height = root.scrollHeight;
                  stableFrames = height === previousHeight ? stableFrames + 1 : 0;
                  previousHeight = height;
                  frames += 1;

                  const canRestore = height - window.innerHeight >= position.y;
                  const layoutIsStable = stableFrames >= 3;
                  if (
                    (document.readyState === "loading" || (!canRestore && !layoutIsStable)) &&
                    frames < 120
                  ) {
                    requestAnimationFrame(restoreScroll);
                    return;
                  }

                  window.scrollTo(position.x, position.y);
                  root.style.removeProperty("visibility");
                };
                requestAnimationFrame(restoreScroll);
              }
            } catch {}
          }

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
