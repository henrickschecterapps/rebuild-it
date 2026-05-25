import { useMemo } from "react";
import type { TriplaEvent } from "@/types/evento";
import { parseEventStringDate } from "@/lib/dateUtils";
import {
  ArrowUpRight, MapPin, Clock, Calendar, Briefcase, Sparkles, Flag,
  Cpu, HeartPulse, Globe, Monitor, Users,
} from "lucide-react";

const TYPE_META: Record<string, { gradient: string; Icon: React.ComponentType<{ className?: string }> }> = {
  "Comercial":             { gradient: "from-[var(--color-brand-tang-blue)] via-[var(--color-accent)] to-[var(--color-brand-celestial)]", Icon: Briefcase },
  "Comercial Interno":     { gradient: "from-[var(--color-brand-space-cadet)] via-[var(--color-brand-tang-blue)] to-[var(--color-accent)]", Icon: Sparkles },
  "Comercial Patrocinado": { gradient: "from-[var(--color-purple)] via-[var(--color-accent)] to-[var(--color-brand-celestial)]", Icon: Sparkles },
  "Evento Interno":        { gradient: "from-[var(--color-green)] via-[var(--color-teal)] to-[var(--color-brand-celestial)]", Icon: HeartPulse },
  "Interno":               { gradient: "from-[var(--color-green)] via-[var(--color-teal)] to-[var(--color-brand-celestial)]", Icon: Users },
  "Feriado":               { gradient: "from-[var(--color-amber)] via-[var(--color-pink)] to-[var(--color-red)]", Icon: Flag },
  "Workshop":              { gradient: "from-[var(--color-teal)] via-[var(--color-accent)] to-[var(--color-purple)]", Icon: Cpu },
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(({ ev, date }) => {
        const monthShort = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").slice(0, 3).toUpperCase();
        const dayNum = date.getDate();
        const timeStr = ev.hora_ini || date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const location = [ev.cidade, ev.uf].filter(Boolean).join("/") || ev.localidade || "—";
        const isHoli = ev.tipo === "Feriado";
        const meta = TYPE_META[ev.tipo || ""] || TYPE_META["Comercial"];
        const Icon = meta.Icon;
        const FormatIcon = ev.formato ? (FORMAT_ICONS[ev.formato] || Monitor) : null;
        return (
          <div
            key={ev.id}
            onClick={() => onSelectEvent?.(ev)}
            className="group relative cursor-pointer animate-fade-up rounded-[28px] border border-border bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            {/* Banner */}
            <div className={`relative h-40 bg-gradient-to-tr ${meta.gradient} overflow-hidden flex items-center justify-center`}>
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />

              <div className="absolute top-4 left-4 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-md rounded-2xl h-14 w-14 shadow-lg border border-border z-20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-[9px] font-bold tracking-widest text-accent leading-none">{monthShort}</span>
                <span className="text-lg font-bold font-heading text-text leading-none mt-1">{dayNum}</span>
              </div>

              {ev.tipo && (
                <span className="absolute bottom-4 left-4 text-[9px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 bg-black/30 text-white z-10">
                  {ev.tipo}
                </span>
              )}

              <div className="relative h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/15 text-accent text-[11px] font-semibold">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</span>
                  <span className="opacity-40">•</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{isHoli ? "O dia todo" : timeStr}</span>
                </div>

                {!isHoli && ev.status && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-border bg-surface2 text-text/80">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[ev.status] || "bg-muted"}`} />
                    {ev.status}
                  </span>
                )}

                {!isHoli && ev.formato && FormatIcon && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-border bg-surface2 text-text/80">
                    <FormatIcon className="h-3.5 w-3.5" />
                    {ev.formato}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold tracking-tight font-heading text-text group-hover:text-accent transition-colors line-clamp-1">
                {ev.evento || "Sem título"}
              </h3>

              {ev.descricao && (
                <p className="text-xs mt-2 leading-relaxed text-muted line-clamp-2">{ev.descricao}</p>
              )}

              {ev.responsavel && !isHoli && (
                <p className="text-[10px] mt-3 text-muted font-medium">
                  Responsável: <span className="font-semibold text-text/80">{ev.responsavel}</span>
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted font-medium min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-pink)]" />
                  <span className="truncate">{location}</span>
                </div>
                <span className="text-[10px] font-bold text-accent tracking-wider uppercase flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform duration-300">
                  Detalhes <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
