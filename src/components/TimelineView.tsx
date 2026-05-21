import { useMemo } from "react";
import type { TriplaEvent } from "@/types/evento";
import { parseEventStringDate } from "@/lib/dateUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Users, Clock } from "lucide-react";

interface TimelineViewProps {
  eventsToRender: TriplaEvent[];
  onSelectEvent?: (ev: TriplaEvent) => void;
}

interface MonthGroup {
  key: string;
  label: string;
  events: { ev: TriplaEvent; date: Date }[];
}

export default function TimelineView({ eventsToRender, onSelectEvent }: TimelineViewProps) {
  const groups = useMemo<MonthGroup[]>(() => {
    const withDates = eventsToRender
      .map((ev) => ({ ev, date: parseEventStringDate(ev.data_ini) }))
      .filter((x): x is { ev: TriplaEvent; date: Date } => !!x.date)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const map = new Map<string, MonthGroup>();
    for (const item of withDates) {
      const key = `${item.date.getFullYear()}-${item.date.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: format(item.date, "MMMM 'de' yyyy", { locale: ptBR }),
          events: [],
        });
      }
      map.get(key)!.events.push(item);
    }
    return Array.from(map.values());
  }, [eventsToRender]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const colorFor = (ev: TriplaEvent) => {
    if (ev.tipo === "Feriado") return "var(--amber)";
    if (ev.tipo?.includes("Comercial")) return "var(--accent)";
    return "var(--green)";
  };

  if (groups.length === 0) {
    return (
      <div className="h-full w-full bg-surface/40 backdrop-blur-3xl rounded-[32px] shadow-sm border border-border p-12 flex items-center justify-center text-muted text-sm">
        Nenhum evento para exibir na timeline.
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-surface/40 backdrop-blur-3xl rounded-[32px] shadow-sm border border-border p-6 sm:p-10 transition-all duration-500">
      <div className="relative">
        {/* Vertical line */}
        <div
          aria-hidden
          className="absolute left-[7.5rem] top-2 bottom-2 w-px hidden md:block"
          style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--border) 80%, transparent), transparent)" }}
        />

        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="font-heading font-bold text-xl text-text capitalize mb-6 md:pl-[10rem]">
                {group.label}
                <span className="ml-3 text-xs font-medium text-muted">
                  {group.events.length} evento{group.events.length === 1 ? "" : "s"}
                </span>
              </h3>

              <ul className="space-y-4">
                {group.events.map(({ ev, date }) => {
                  const isPast = date.getTime() < today.getTime();
                  const color = colorFor(ev);
                  return (
                    <li key={ev.id} className="relative flex flex-col md:flex-row md:items-stretch gap-4 md:gap-0">
                      {/* Date column */}
                      <div className="md:w-[7.5rem] md:pr-6 md:text-right shrink-0">
                        <div className="font-heading font-black text-2xl text-text leading-none">
                          {format(date, "dd")}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-muted mt-1">
                          {format(date, "EEE", { locale: ptBR })}
                        </div>
                        {ev.hora_ini && (
                          <div className="text-xs text-muted mt-1 flex items-center md:justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {ev.hora_ini}
                          </div>
                        )}
                      </div>

                      {/* Dot */}
                      <div className="hidden md:flex absolute left-[7.5rem] -translate-x-1/2 top-2 items-center justify-center">
                        <span
                          className="w-3 h-3 rounded-full ring-4"
                          style={{
                            background: color,
                            boxShadow: `0 0 0 4px color-mix(in srgb, ${color} 15%, transparent)`,
                            ['--tw-ring-color' as never]: "var(--bg)",
                          }}
                        />
                      </div>

                      {/* Card */}
                      <button
                        type="button"
                        onClick={() => onSelectEvent?.(ev)}
                        className="group flex-1 md:ml-10 text-left rounded-2xl border border-border bg-surface hover:bg-surface2 transition-all duration-300 p-5 hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ borderLeft: `3px solid ${color}` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-heading font-bold text-base text-text truncate group-hover:text-accent transition-colors">
                              {ev.evento || "Sem título"}
                            </h4>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                              {ev.tipo && (
                                <span className="px-2 py-0.5 rounded-full bg-surface2 text-text/80 font-medium">
                                  {ev.tipo}
                                </span>
                              )}
                              {(ev.cidade || ev.uf || ev.localidade) && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {[ev.cidade, ev.uf].filter(Boolean).join(" / ") || ev.localidade}
                                </span>
                              )}
                              {ev.responsavel && (
                                <span className="inline-flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {ev.responsavel}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className="shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md"
                            style={{
                              color: isPast ? "var(--muted)" : color,
                              background: isPast
                                ? "color-mix(in srgb, var(--muted) 10%, transparent)"
                                : `color-mix(in srgb, ${color} 10%, transparent)`,
                            }}
                          >
                            {isPast ? "Realizado" : ev.status || "Agendado"}
                          </span>
                        </div>
                        {ev.descricao && (
                          <p className="mt-3 text-sm text-muted line-clamp-2">{ev.descricao}</p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}