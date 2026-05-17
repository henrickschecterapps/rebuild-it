import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";
import { useTheme } from "@/store/useTheme";

/**
 * Mounts once at the root: initializes Supabase auth listener and applies
 * persisted theme to the DOM.
 */
export function AppInit() {
  const initAuth = useAuth((s) => s.initAuth);
  const theme = useTheme((s) => s.theme);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}