import { useMemo } from "react";
import type { TriplaEvent } from "@/types/evento";
import { parseEventStringDate } from "@/lib/dateUtils";
import { ArrowUpRight, MapPin, Monitor, Globe } from "lucide-react";

const TYPE_DOT: Record<string, string> = {
  "Comercial": "bg-[var(--color-accent)]",
  "Comercial Interno": "bg-[var(--color-brand-tang-blue)]",
  "Comercial Patrocinado": "bg-[var(--color-purple)]",
  "Evento Interno": "bg-[var(--color-green)]",
  "Interno": "bg-[var(--color-green)]",
  "Feriado": "bg-[var(--color-amber)]",
  "Workshop": "bg-[var(--color-teal)]",
};

const FORMAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Online": Monitor,
  "Presencial": MapPin,
  "Híbrido": Globe,
};

const STATUS_DOT: Record<string, string> = {
  "Planejado": "bg-[var(--color-accent)]",
  "Confirmado": "bg-[var(--color-green)]",
  "Em negociação": "bg-[var(--color-amber)]",
  "Concluído": "bg-muted",
  "Cancelado": "bg-[var(--color-red)]",
};

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
    <div className="relative max-w-4xl mx-auto pl-4 sm:pl-10">
      {/* vertical line */}
      <div className="absolute left-8 sm:left-44 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-10">
        {items.map(({ ev, date }) => {
          const isHoli = ev.tipo === "Feriado";
          const dot = TYPE_DOT[ev.tipo || ""] || "bg-accent";
          const monthShort = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
          const dayNum = date.getDate();
          const timeStr = ev.hora_ini || date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const location = [ev.cidade, ev.uf].filter(Boolean).join("/") || ev.localidade || "—";
          const FormatIcon = ev.formato ? (FORMAT_ICONS[ev.formato] || Monitor) : null;

          return (
            <div key={ev.id} className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 group animate-fade-up">
              {/* node */}
              <div className="absolute left-4 sm:left-[136px] -translate-x-1/2 top-5 z-10">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-border bg-surface shadow-md group-hover:border-accent transition-all duration-300 group-hover:scale-110">
                  <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                </div>
              </div>

              {/* date pill */}
              <div className="pl-12 sm:pl-0 sm:w-28 pt-1 shrink-0 text-left sm:text-center">
                <div className="flex flex-col items-start sm:items-center bg-accent/10 rounded-[18px] p-3.5 border border-accent/15 shadow-sm">
                  <span className="text-3xl font-extrabold font-heading text-accent leading-none tracking-tighter">
                    {dayNum}
                  </span>
                  <span className="text-[10px] font-extrabold tracking-widest text-accent/80 uppercase mt-2 font-heading bg-accent/15 px-2 py-0.5 rounded-md">
                    {monthShort}
                  </span>
                </div>
                <p className="text-[10px] text-muted font-bold mt-2.5 sm:text-center uppercase tracking-widest bg-surface py-1.5 px-2 rounded-lg border border-border shadow-sm inline-block sm:block w-max sm:w-auto">
                  {isHoli ? "Dia todo" : timeStr}
                </p>
              </div>

              {/* card */}
              <div
                onClick={() => onSelectEvent?.(ev)}
                className="flex-1 p-7 rounded-[28px] border border-border bg-surface cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {ev.tipo && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border bg-surface2 text-text/80">
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                      {ev.tipo}
                    </span>
                  )}
                  {!isHoli && ev.status && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border bg-surface2 text-text/80">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[ev.status] || "bg-muted"}`} />
                      {ev.status}
                    </span>
                  )}
                  {!isHoli && ev.formato && FormatIcon && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border bg-surface2 text-text/80">
                      <FormatIcon className="h-3.5 w-3.5" />
                      {ev.formato}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold tracking-tight font-heading text-text group-hover:text-accent transition-colors">
                  {ev.evento || "Sem título"}
                </h3>

                {ev.descricao && (
                  <p className="text-xs mt-2.5 leading-relaxed text-muted">{ev.descricao}</p>
                )}

                {ev.responsavel && !isHoli && (
                  <p className="text-[10px] mt-2.5 text-muted font-medium">
                    Responsável: <span className="font-semibold text-text/80">{ev.responsavel}</span>
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted font-medium">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    <span>{location}</span>
                  </div>
                  <span className="text-[10px] font-bold text-accent tracking-wider uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    Expandir <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
