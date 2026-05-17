import { supabase } from "@/integrations/supabase/client";

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function signUpUser(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });
  if (error) throw error;
  return data.user;
}