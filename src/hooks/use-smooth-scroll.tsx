import { useCallback } from "react";

export const useSmoothScroll = () => {
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Unable to find element: ${elementId}`);
      return;
    }

    // ヘッダーの高さを考慮したオフセット
    const headerHeight = 64; // ヘッダーの高さを適宜調整してください
    const yOffset = -headerHeight;

    const elementTop = element.getBoundingClientRect().top;
    const targetY = window.pageYOffset + elementTop + yOffset;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
  }, []);

  return { scrollToElement };
};
