import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Moon, Sun, Calendar as CalendarIcon } from "lucide-react";

import { useAuth } from "@/store/useAuth";
import { useTheme } from "@/store/useTheme";
import { logout } from "@/lib/supabase-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPlaceholder,
});

function DashboardPlaceholder() {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="h-20 w-full bg-surface/90 backdrop-blur-xl sticky top-0 z-50 border-b border-border flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-wider uppercase text-text">Tripla Eventos</h1>
            <p className="text-xs text-muted -mt-0.5">Painel v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted hover:text-red hover:bg-red/10 transition-colors text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 animate-fade-up">
        <div className="card p-10">
          <h2 className="font-heading text-3xl font-black text-text mb-3">
            Bem-vindo, {user?.email}
          </h2>
          <p className="text-muted leading-relaxed">
            Fase 1 concluída: autenticação, design system e rotas protegidas estão no ar.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-surface2/40 p-5">
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Seu cargo</p>
              <p className="mt-2 font-heading font-black text-2xl text-accent">
                {isAdmin ? "Administrador" : "Usuário"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface2/40 p-5">
              <p className="text-xs uppercase tracking-wider text-muted font-bold">Próxima fase</p>
              <p className="mt-2 font-heading font-black text-2xl text-text">
                Eventos + Calendário
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/calendar"
              className="btn-primary inline-flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" /> Abrir calendário
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}