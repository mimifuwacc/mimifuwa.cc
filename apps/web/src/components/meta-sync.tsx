import { fetchMeta, setMeta } from "haribote/client";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** ルート遷移ごとに meta 情報を取得して反映する（古い結果は破棄） */
export default function MetaSync() {
  const location = useLocation();

  useEffect(() => {
    let active = true;
    void fetchMeta(location.pathname).then((meta) => {
      if (active) setMeta(meta);
    });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  return null;
}
