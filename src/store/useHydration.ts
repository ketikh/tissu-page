import { useEffect, useState } from "react";
import { useAuthStore } from "./useAuthStore";
import { useCartStore } from "./useCartStore";

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
