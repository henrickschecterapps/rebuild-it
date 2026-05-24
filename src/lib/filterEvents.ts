import type { TriplaEvent } from "@/types/evento";
import { parseEventStringDate } from "@/lib/dateUtils";
import type { CalendarFiltersState } from "@/components/CalendarFilters";

export function filterEvents(events: TriplaEvent[], f: CalendarFiltersState): TriplaEvent[] {
  const q = f.search.trim().toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return events.filter((e) => {
    if (f.tipo && e.tipo !== f.tipo) return false;
    if (f.status && e.status !== f.status) return false;
    if (f.responsavel && e.responsavel !== f.responsavel) return false;

    if (q) {
      const hay = [
        e.evento,
        e.descricao,
        e.localidade,
        e.cidade,
        e.uf,
        e.responsavel,
        e.tipo,
        e.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (f.period !== "all") {
      const d = parseEventStringDate(e.data_ini);
      if (!d) return false;
      if (f.period === "upcoming" && (d < now || d > in30)) return false;
      if (f.period === "month" && (d < monthStart || d > monthEnd)) return false;
      if (f.period === "past" && d >= now) return false;
    }

    return true;
  });
}