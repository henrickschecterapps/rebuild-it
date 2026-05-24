import { Search, X } from "lucide-react";
import type { TriplaEvent } from "@/types/evento";
import { useMemo } from "react";

export type PeriodFilter = "all" | "upcoming" | "month" | "past";

export interface CalendarFiltersState {
  search: string;
  tipo: string;
  status: string;
  responsavel: string;
  period: PeriodFilter;
}

export const defaultFilters: CalendarFiltersState = {
  search: "",
  tipo: "",
  status: "",
  responsavel: "",
  period: "all",
};

interface Props {
  events: TriplaEvent[];
  filters: CalendarFiltersState;
  onChange: (f: CalendarFiltersState) => void;
}

export default function CalendarFilters({ events, filters, onChange }: Props) {
  const { tipos, statuses, responsaveis } = useMemo(() => {
    const t = new Set<string>();
    const s = new Set<string>();
    const r = new Set<string>();
    for (const e of events) {
      if (e.tipo) t.add(e.tipo);
      if (e.status) s.add(e.status);
      if (e.responsavel) r.add(e.responsavel);
    }
    return {
      tipos: Array.from(t).sort(),
      statuses: Array.from(s).sort(),
      responsaveis: Array.from(r).sort(),
    };
  }, [events]);

  const set = <K extends keyof CalendarFiltersState>(k: K, v: CalendarFiltersState[K]) =>
    onChange({ ...filters, [k]: v });

  const hasActive =
    filters.search ||
    filters.tipo ||
    filters.status ||
    filters.responsavel ||
    filters.period !== "all";

  const selectCls =
    "h-10 px-3 rounded-xl border border-border bg-surface text-sm text-text hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors min-w-0";

  return (
    <div className="mb-6 p-4 rounded-2xl border border-border bg-surface/60 backdrop-blur-xl flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Buscar por nome, descrição, local…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <select className={selectCls} value={filters.period} onChange={(e) => set("period", e.target.value as PeriodFilter)}>
        <option value="all">Todos os períodos</option>
        <option value="upcoming">Próximos 30 dias</option>
        <option value="month">Este mês</option>
        <option value="past">Passados</option>
      </select>

      <select className={selectCls} value={filters.tipo} onChange={(e) => set("tipo", e.target.value)}>
        <option value="">Todos os tipos</option>
        {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select className={selectCls} value={filters.status} onChange={(e) => set("status", e.target.value)}>
        <option value="">Todos os status</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select className={selectCls} value={filters.responsavel} onChange={(e) => set("responsavel", e.target.value)}>
        <option value="">Todos os responsáveis</option>
        {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      {hasActive && (
        <button
          onClick={() => onChange(defaultFilters)}
          className="h-10 px-3 rounded-xl text-sm font-semibold text-muted hover:text-text hover:bg-surface2 transition-colors flex items-center gap-1.5"
        >
          <X className="w-4 h-4" /> Limpar
        </button>
      )}
    </div>
  );
}