import { useEffect, useState } from "react";
import { useAuthStore } from "./useAuthStore";

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
