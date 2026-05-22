import { useMemo } from "react";
import type { TriplaEvent } from "@/types/evento";
import { parseEventStringDate } from "@/lib/dateUtils";
import { ArrowUpRight, MapPin, Clock, User } from "lucide-react";

interface CardsViewProps {
  eventsToRender: TriplaEvent[];
  onSelectEvent?: (ev: TriplaEvent) => void;
}

export default function CardsView({ eventsToRender, onSelectEvent }: CardsViewProps) {
  const items = useMemo(() => {
    return eventsToRender
      .map((ev) => ({ ev, date: parseEventStringDate(ev.data_ini) }))
      .filter((x): x is { ev: TriplaEvent; date: Date } => !!x.date)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [eventsToRender]);

  if (items.length === 0) {
    return (
      <div className="h-full w-full bg-surface/40 backdrop-blur-3xl rounded-[32px] shadow-sm border border-border p-12 flex items-center justify-center text-muted text-sm">
        Nenhum evento para exibir em cards.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map(({ ev, date }) => {
        const monthShort = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").slice(0, 3);
        const dayNum = date.getDate();
        const timeStr = ev.hora_ini || date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const location = [ev.cidade, ev.uf].filter(Boolean).join("/") || ev.localidade || "—";
        const isComercial = ev.tipo?.includes("Comercial");
        const accentVar = ev.tipo === "Feriado" ? "var(--amber)" : isComercial ? "var(--accent)" : "var(--green)";
        return (
          <div
            key={ev.id}
            onClick={() => onSelectEvent?.(ev)}
            className="group cursor-pointer animate-fade-up rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
            style={{ borderTop: `3px solid ${accentVar}` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-3 w-16 rounded-xl flex flex-col items-center justify-center border border-border bg-surface2 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{monthShort}</span>
                <span className="text-2xl font-bold font-heading text-accent leading-none mt-1">{dayNum}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {ev.tipo && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border bg-surface2 text-text/80">
                    {ev.tipo}
                  </span>
                )}
                {ev.status && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                    {ev.status}
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold font-heading text-text group-hover:text-accent transition-colors line-clamp-2">
                {ev.evento || "Sem título"}
              </h4>
              {ev.descricao && (
                <p className="text-xs text-muted mt-2 line-clamp-2">{ev.descricao}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="font-semibold">{timeStr}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
              {ev.responsavel && (
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{ev.responsavel}</span>
                </div>
              )}
            </div>

            <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent transition-all" />
          </div>
        );
      })}
    </div>
  );
}