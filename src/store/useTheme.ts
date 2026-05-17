import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
}

function applyDom(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        applyDom(next);
      },
      setTheme: (t) => {
        set({ theme: t });
        applyDom(t);
      },
    }),
    {
      name: "tripla-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyDom(state.theme);
      },
    },
  ),
);