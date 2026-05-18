import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar as CalendarIcon, Plus, Download, LogOut, Moon, Sun, ArrowLeft } from "lucide-react";
import type { View } from "react-big-calendar";

import { useEvents } from "@/store/useEvents";
import { useAuth } from "@/store/useAuth";
import { useTheme } from "@/store/useTheme";
import { logout } from "@/lib/supabase-auth";
import { exportICS } from "@/lib/eventActions";
import CalendarGrid from "@/components/CalendarGrid";
import EventFormModal from "@/components/EventFormModal";

export const Route = createFileRoute("/_authenticated/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const { events, fetchEvents, openNew, loading } = useEvents();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<View>("month");

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="h-20 w-full bg-surface/90 backdrop-blur-xl sticky top-0 z-50 border-b border-border flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-wider uppercase text-text">Calendário</h1>
            <p className="text-xs text-muted -mt-0.5">{events.length} eventos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportICS(events)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted hover:text-text hover:bg-surface2 transition-colors text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> Exportar .ics
          </button>
          {isAdmin && (
            <button onClick={openNew} className="btn-primary flex items-center gap-2 py-2.5">
              <Plus className="w-4 h-4" /> Novo evento
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => logout()}
            className="p-2.5 rounded-xl text-muted hover:text-red hover:bg-red/10 transition-colors"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 animate-fade-up">
        {loading && events.length === 0 ? (
          <div className="text-muted text-sm">Carregando eventos...</div>
        ) : (
          <CalendarGrid
            eventsToRender={events}
            view={view}
            onView={setView}
            onSelectEvent={(ev) => useEvents.getState().openEdit(ev)}
          />
        )}
      </main>

      <EventFormModal />
    </div>
  );
}