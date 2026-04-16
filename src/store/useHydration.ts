import { useEffect, useState } from "react";
import { useAuthStore } from "./useAuthStore";
import { useCartStore } from "./useCartStore";
import { createClient } from "@/lib/supabase/client";

let authListenerInitialized = false;

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    setHydrated(true);

    if (authListenerInitialized) return;
    authListenerInitialized = true;

    const supabase = createClient();

    // Listen to Supabase auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (session?.user) {
          await useAuthStore.getState().refreshProfile();
        }
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    });
  }, []);

  return hydrated;
}
