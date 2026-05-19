import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { InventoryItem } from "@/types/inventory";

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  upsertItem: (item: Partial<InventoryItem> & { nome: string }) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useInventory = create<InventoryState>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("nome", { ascending: true });
    if (error) {
      console.error(error);
      set({ loading: false });
      return;
    }
    set({ items: (data || []) as unknown as InventoryItem[], loading: false });
  },

  upsertItem: async (item) => {
    if (item.id) {
      const { error } = await supabase
        .from("inventory_items")
        .update(item as never)
        .eq("id", item.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("inventory_items").insert(item as never);
      if (error) throw error;
    }
    await get().fetchItems();
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw error;
    await get().fetchItems();
  },
}));