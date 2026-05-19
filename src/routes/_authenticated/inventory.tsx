import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Plus, Search, Edit2, Trash2, X, Save, ArrowLeft, LogOut, Moon, Sun, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useInventory } from "@/store/useInventory";
import { useAuth } from "@/store/useAuth";
import { useTheme } from "@/store/useTheme";
import { logout } from "@/lib/supabase-auth";
import { CATEGORIAS_ALMOX, type InventoryItem } from "@/types/inventory";

export const Route = createFileRoute("/_authenticated/inventory")({
  component: InventoryPage,
});

const emptyItem: Partial<InventoryItem> = {
  nome: "",
  categoria: "Brinde",
  unidade: "un",
  qtd_total: 0,
  qtd_reservada: 0,
  custo_unitario: 0,
  ativo: true,
};

function InventoryPage() {
  const { items, fetchItems, upsertItem, deleteItem, loading } = useInventory();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [editing, setEditing] = useState<Partial<InventoryItem> | null>(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        !search ||
        i.nome.toLowerCase().includes(search.toLowerCase()) ||
        (i.fornecedor || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "Todos" || i.categoria === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [items, search, categoryFilter]);

  const totals = useMemo(() => {
    const totalItens = items.length;
    const totalEstoque = items.reduce((acc, i) => acc + (i.qtd_total || 0), 0);
    const totalReservado = items.reduce((acc, i) => acc + (i.qtd_reservada || 0), 0);
    const valorEstoque = items.reduce(
      (acc, i) => acc + (i.qtd_total || 0) * Number(i.custo_unitario || 0),
      0,
    );
    return { totalItens, totalEstoque, totalReservado, valorEstoque };
  }, [items]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="h-20 w-full bg-surface/90 backdrop-blur-xl sticky top-0 z-50 border-b border-border flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-wider uppercase text-text">Almoxarifado</h1>
            <p className="text-xs text-muted -mt-0.5">{totals.totalItens} itens cadastrados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setEditing({ ...emptyItem })} className="btn-primary flex items-center gap-2 py-2.5">
              <Plus className="w-4 h-4" /> Novo item
            </button>
          )}
          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors" aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => logout()} className="p-2.5 rounded-xl text-muted hover:text-red hover:bg-red/10 transition-colors" aria-label="Sair">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 animate-fade-up">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Kpi label="Itens" value={totals.totalItens.toString()} />
          <Kpi label="Estoque total" value={totals.totalEstoque.toLocaleString("pt-BR")} />
          <Kpi label="Reservado" value={totals.totalReservado.toLocaleString("pt-BR")} />
          <Kpi label="Valor em estoque" value={totals.valorEstoque.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou fornecedor..."
              className="input-base pl-11"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-base md:w-56"
          >
            <option value="Todos">Todas categorias</option>
            {CATEGORIAS_ALMOX.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="p-10 text-center text-muted text-sm">Carregando itens...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted text-sm">Nenhum item encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface2/50 border-b border-border">
                  <tr className="text-[10px] font-black text-muted uppercase tracking-widest">
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Categoria</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-right px-4 py-3">Reservado</th>
                    <th className="text-right px-4 py-3">Disponível</th>
                    <th className="text-right px-4 py-3">Custo un.</th>
                    <th className="text-left px-4 py-3">Local</th>
                    {isAdmin && <th className="text-right px-4 py-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => {
                    const disp = (i.qtd_total || 0) - (i.qtd_reservada || 0);
                    return (
                      <tr key={i.id} className="border-b border-border/50 hover:bg-surface2/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-text">{i.nome}</td>
                        <td className="px-4 py-3 text-muted">{i.categoria}</td>
                        <td className="px-4 py-3 text-right text-text">{i.qtd_total}</td>
                        <td className="px-4 py-3 text-right text-muted">{i.qtd_reservada}</td>
                        <td className={`px-4 py-3 text-right font-black ${disp <= 0 ? "text-red" : "text-emerald-500"}`}>{disp}</td>
                        <td className="px-4 py-3 text-right text-muted">
                          {Number(i.custo_unitario || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="px-4 py-3 text-muted">{i.localizacao || "—"}</td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setEditing(i)} className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors" aria-label="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Excluir "${i.nome}"?`)) return;
                                  try {
                                    await deleteItem(i.id);
                                    toast.success("Item removido.");
                                  } catch (err) {
                                    toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
                                  }
                                }}
                                className="p-2 rounded-lg hover:bg-red/10 text-muted hover:text-red transition-colors"
                                aria-label="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editing && (
        <InventoryItemModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            try {
              await upsertItem(data);
              toast.success(data.id ? "Item atualizado!" : "Item criado!");
              setEditing(null);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
            }
          }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">{label}</div>
      <div className="text-2xl font-black text-text">{value}</div>
    </div>
  );
}

function InventoryItemModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<InventoryItem>;
  onClose: () => void;
  onSave: (data: Partial<InventoryItem> & { nome: string }) => Promise<void>;
}) {
  const [data, setData] = useState<Partial<InventoryItem>>(initial);
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<InventoryItem>) => setData((p) => ({ ...p, ...patch }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !saving && onClose()} />
      <div className="relative bg-surface w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border animate-fade-up">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <h2 className="text-xl font-black text-text flex items-center gap-3">
            <div className="w-1.5 h-6 bg-accent rounded-full" />
            {data.id ? "Editar item" : "Novo item"}
          </h2>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={saving} className="p-2.5 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={async () => {
                if (!data.nome) {
                  toast.error("Nome é obrigatório.");
                  return;
                }
                setSaving(true);
                await onSave(data as Partial<InventoryItem> & { nome: string });
                setSaving(false);
              }}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-bg/50 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>Nome *</Label>
              <input className="input-base" value={data.nome || ""} onChange={(e) => set({ nome: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <select className="input-base" value={data.categoria || "Brinde"} onChange={(e) => set({ categoria: e.target.value })}>
                {CATEGORIAS_ALMOX.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Unidade</Label>
              <input className="input-base" value={data.unidade || ""} onChange={(e) => set({ unidade: e.target.value })} placeholder="un, kg, cx..." />
            </div>
            <div>
              <Label>Quantidade total</Label>
              <input type="number" className="input-base" value={data.qtd_total ?? 0} onChange={(e) => set({ qtd_total: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <Label>Quantidade reservada</Label>
              <input type="number" className="input-base" value={data.qtd_reservada ?? 0} onChange={(e) => set({ qtd_reservada: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <Label>Custo unitário (R$)</Label>
              <input type="number" step="0.01" className="input-base" value={data.custo_unitario ?? 0} onChange={(e) => set({ custo_unitario: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <input className="input-base" value={data.fornecedor || ""} onChange={(e) => set({ fornecedor: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Localização</Label>
              <input className="input-base" value={data.localizacao || ""} onChange={(e) => set({ localizacao: e.target.value })} placeholder="Prateleira A2, Sala 3..." />
            </div>
            <div className="md:col-span-2">
              <Label>Foto (URL)</Label>
              <input className="input-base" value={data.foto_url || ""} onChange={(e) => set({ foto_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <Label>Observações</Label>
              <textarea className="input-base min-h-[80px]" value={data.obs || ""} onChange={(e) => set({ obs: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">{children}</label>;
}