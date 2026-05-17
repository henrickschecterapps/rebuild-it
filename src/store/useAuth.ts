import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  initAuth: () => void;
  refreshRole: (userId: string) => Promise<void>;
}

let unsubscribe: (() => void) | null = null;

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  loading: true,
  initialized: false,

  refreshRole: async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) {
      console.error("Erro ao buscar role:", error);
      set({ isAdmin: false });
      return;
    }
    set({ isAdmin: !!data });
  },

  initAuth: () => {
    if (get().initialized) return;
    set({ initialized: true });

    // 1. Listener first (sync state setter — async work deferred)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({ user, loading: false });
      if (user) {
        // Defer to next tick to avoid deadlocks in listener
        setTimeout(() => {
          get().refreshRole(user.id);
        }, 0);
      } else {
        set({ isAdmin: false });
      }
    });
    unsubscribe = () => subscription.unsubscribe();

    // 2. Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      set({ user, loading: false });
      if (user) get().refreshRole(user.id);
    }).catch((err) => {
      console.error("Falha ao recuperar sessão:", err);
      set({ loading: false });
    });
  },
}));

export function teardownAuth() {
  unsubscribe?.();
  unsubscribe = null;
}