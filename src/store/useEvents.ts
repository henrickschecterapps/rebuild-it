import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { TriplaEvent } from "@/types/evento";

interface EventsState {
  events: TriplaEvent[];
  loading: boolean;
  selectedEvent: TriplaEvent | null;
  isEditingEvent: boolean;
  fetchEvents: () => Promise<void>;
  setSelectedEvent: (e: TriplaEvent | null) => void;
  setIsEditingEvent: (v: boolean) => void;
  openNew: () => void;
  openEdit: (e: TriplaEvent) => void;
  close: () => void;
}

export const useEvents = create<EventsState>((set) => ({
  events: [],
  loading: false,
  selectedEvent: null,
  isEditingEvent: false,

  fetchEvents: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("data_ini", { ascending: false });
    if (error) {
      console.error("Erro ao buscar eventos:", error);
      set({ loading: false });
      return;
    }
    set({ events: (data || []) as unknown as TriplaEvent[], loading: false });
  },

  setSelectedEvent: (e) => set({ selectedEvent: e }),
  setIsEditingEvent: (v) => set({ isEditingEvent: v }),
  openNew: () => set({ selectedEvent: null, isEditingEvent: true }),
  openEdit: (e) => set({ selectedEvent: e, isEditingEvent: true }),
  close: () => set({ selectedEvent: null, isEditingEvent: false }),
}));