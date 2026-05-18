import { supabase } from "@/integrations/supabase/client";
import type { TriplaEvent } from "@/types/evento";

/** Export filtered events as an .ics (iCalendar) file. */
export function exportICS(events: TriplaEvent[]) {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Tripla//Eventos//PT\n";
  events.forEach((e) => {
    if (!e.data_ini) return;
    const start = e.data_ini.replace(/-/g, "") + "T000000Z";
    const end = (e.data_fim || e.data_ini).replace(/-/g, "") + "T235959Z";
    ics += `BEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${e.evento || "Sem título"}\nDESCRIPTION:Resp: ${e.responsavel || ""} | Status: ${e.status || ""}\nEND:VEVENT\n`;
  });
  ics += "END:VCALENDAR";
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "eventos-tripla.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Duplicate an event. */
export async function duplicateEvent(event: TriplaEvent) {
  const { id, created_at, updated_at, ...data } = event;
  void id; void created_at; void updated_at;
  const copy = {
    ...data,
    evento: `${event.evento} (Cópia)`,
    status: "Planejado",
  };
  const { data: inserted, error } = await supabase
    .from("events")
    .insert(copy as never)
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
}

/** Delete an event. */
export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;
}

/** Append a history entry to an event's jsonb history column. */
export async function logEventHistory(
  eventId: string,
  action: string,
  authorEmail: string,
  summary?: string,
) {
  const authorName = authorEmail
    .split("@")[0]
    .replace(".", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const { data: row } = await supabase
    .from("events")
    .select("historico")
    .eq("id", eventId)
    .single();
  const existing = (row?.historico as unknown[] | null) || [];
  const entry = {
    editor: authorName,
    data: new Date().toISOString(),
    acao: action,
    summary: summary || "",
  };
  await supabase
    .from("events")
    .update({ historico: [entry, ...existing] as never })
    .eq("id", eventId);
}