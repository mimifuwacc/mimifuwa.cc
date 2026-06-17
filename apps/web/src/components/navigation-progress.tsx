import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { NAV_PROGRESS_DONE_DELAY_MS } from "@/lib/constants";

type ProgressState = "hidden" | "loading" | "done";

export default function NavigationProgress() {
  const navigation = useNavigation();
  const [state, setState] = useState<ProgressState>("hidden");

  useEffect(() => {
    if (navigation.state !== "idle") {
      setState("loading");
    } else if (state === "loading") {
      setState("done");
      const t = setTimeout(() => setState("hidden"), NAV_PROGRESS_DONE_DELAY_MS);
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
