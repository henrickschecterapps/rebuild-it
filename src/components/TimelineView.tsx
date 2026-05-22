import { useMemo } from "react";
import type { TriplaEvent } from "@/types/evento";
import { parseEventStringDate } from "@/lib/dateUtils";
import { ArrowUpRight } from "lucide-react";

interface TimelineViewProps {
  eventsToRender: TriplaEvent[];
  onSelectEvent?: (ev: TriplaEvent) => void;
}

export default function TimelineView({ eventsToRender, onSelectEvent }: TimelineViewProps) {
  const items = useMemo(() => {
    return eventsToRender
      .map((ev) => ({ ev, date: parseEventStringDate(ev.data_ini) }))
      .filter((x): x is { ev: TriplaEvent; date: Date } => !!x.date)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [eventsToRender]);

  if (items.length === 0) {
    return (
      <div className="h-full w-full bg-surface/40 backdrop-blur-3xl rounded-[32px] shadow-sm border border-border p-12 flex items-center justify-center text-muted text-sm">
        Nenhum evento para exibir na timeline.
      </div>
    );
  }

  return (
    <div
      className="relative pl-8 sm:pl-10 space-y-6 before:absolute before:left-[19px] sm:before:left-[23px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border"
    >
      {items.map(({ ev, date }) => {
        const monthShort = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").slice(0, 3);
        const dayNum = date.getDate();
        const timeStr = ev.hora_ini || date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const location = [ev.cidade, ev.uf].filter(Boolean).join("/") || ev.localidade || "—";
        return (
          <div
            key={ev.id}
            onClick={() => onSelectEvent?.(ev)}
            className="relative group cursor-pointer animate-fade-up"
          >
            {/* Dot on the timeline */}
            <div className="absolute -left-[23px] sm:-left-[27px] top-4 h-4 w-4 rounded-full border-[3px] bg-bg border-accent shadow-md group-hover:scale-125 transition-transform duration-200 z-10" />

            <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-surface2 hover:border-accent/30 hover:shadow-lg">
              <div className="flex items-start gap-4">
                {/* Date box */}
                <div className="p-3.5 w-16 rounded-xl flex flex-col items-center justify-center border border-border bg-surface2 text-center shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    {monthShort}
                  </span>
                  <span className="text-2xl font-bold font-heading text-accent leading-none mt-1">
                    {dayNum}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    {ev.tipo && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border bg-surface2 text-text/80">
                        {ev.tipo}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-muted">
                      {timeStr} · {location}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-heading text-text group-hover:text-accent transition-colors">
                    {ev.evento || "Sem título"}
                  </h4>
                  {ev.descricao && (
                    <p className="text-xs text-muted mt-1 line-clamp-1">{ev.descricao}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                {ev.responsavel && (
                  <span className="text-[10px] font-semibold text-muted hidden sm:inline">
                    {ev.responsavel}
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent transition-all" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}