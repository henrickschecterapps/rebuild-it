import { useEffect, useMemo, useState } from "react";
import { X, Save, AlertCircle, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/useAuth";
import { useEvents } from "@/store/useEvents";
import { deleteEvent, logEventHistory } from "@/lib/eventActions";
import type { TriplaEvent } from "@/types/evento";
import { useInventory } from "@/store/useInventory";
import type { BrindeAlocado } from "@/types/evento";

const DEFAULT_ORGS = ["Gente & Gestão", "Jessica Alves (SP)", "Jessica Andrade (BH)", "Marketing"];

type FormState = Partial<TriplaEvent> & { evento: string; data_ini: string };

type OutroCusto = { id: string; nome: string; descricao: string; valor: number | string };

const toNum = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const empty: FormState = {
  evento: "",
  data_ini: "",
  data_fim: "",
  hora_ini: "",
  hora_fim: "",
  responsavel: "",
  tipo: "Comercial",
  status: "Planejado",
  formato: "Presencial",
  cota: "",
  localidade: "",
  uf: "",
  cidade: "",
  links: "",
  organizadores: [],
  vagas_staff: 0,
  vagas_cliente: 0,
  vagas_vip: 0,
  publico: "",
  participantes: "",
  beneficios: "",
  obs: "",
  descricao: "",
};

export default function EventFormModal() {
  const { isEditingEvent, selectedEvent, close, fetchEvents } = useEvents();
  const { user, isAdmin } = useAuth();
  const { items: inventoryItems, fetchItems: fetchInventory } = useInventory();

  const [formData, setFormData] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditingEvent) return;
    fetchInventory();
    if (selectedEvent) {
      setFormData({
        ...empty,
        ...selectedEvent,
        organizadores: selectedEvent.organizadores || [],
      });
    } else {
      setFormData(empty);
    }
    setError("");
  }, [isEditingEvent, selectedEvent, fetchInventory]);

  if (!isEditingEvent) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === "" ? "" : Number(value)
          : type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ---- Outros custos (lista dinâmica) ----
  const outros: OutroCusto[] = (formData.outros_custos_lista as OutroCusto[]) || [];
  const setOutros = (list: OutroCusto[]) =>
    setFormData((prev) => ({ ...prev, outros_custos_lista: list }));

  const addOutro = () =>
    setOutros([...outros, { id: crypto.randomUUID(), nome: "", descricao: "", valor: 0 }]);
  const updateOutro = (id: string, patch: Partial<OutroCusto>) =>
    setOutros(outros.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const removeOutro = (id: string) => setOutros(outros.filter((o) => o.id !== id));

  // ---- Brindes alocados ----
  const brindes: BrindeAlocado[] = (formData.brindes_alocados as BrindeAlocado[]) || [];
  const setBrindes = (list: BrindeAlocado[]) =>
    setFormData((prev) => ({ ...prev, brindes_alocados: list }));

  const addBrinde = () =>
    setBrindes([...brindes, { id: crypto.randomUUID(), item: "", qtd: 1, docId: "" }]);
  const updateBrinde = (id: string, patch: Partial<BrindeAlocado>) =>
    setBrindes(brindes.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBrinde = (id: string) => setBrindes(brindes.filter((b) => b.id !== id));

  // ---- Totais calculados ----
  const totalCustosFixos = useMemo(
    () =>
      toNum(formData.custo_brindes) +
      toNum(formData.custo_uniformes) +
      toNum(formData.custo_ingressos) +
      toNum(formData.custo_passagens) +
      toNum(formData.custo_hospedagem) +
      toNum(formData.custo_outros),
    [formData],
  );
  const totalOutros = useMemo(
    () => outros.reduce((acc, o) => acc + toNum(o.valor), 0),
    [outros],
  );
  const custoTotal = totalCustosFixos + totalOutros;
  const receita = toNum(formData.receita_estimada);
  const margem = receita - custoTotal;

  const toggleOrg = (org: string) => {
    setFormData((prev) => {
      const list = prev.organizadores || [];
      return {
        ...prev,
        organizadores: list.includes(org) ? list.filter((o) => o !== org) : [...list, org],
      };
    });
  };

  const handleSave = async () => {
    if (!formData.evento || !formData.data_ini) {
      setError("Nome do evento e data inicial são obrigatórios.");
      return;
    }
    if (!isAdmin) {
      setError("Apenas administradores podem salvar eventos.");
      return;
    }
    try {
      setLoading(true);
      setError("");

      const responsavelStr = formData.organizadores?.length
        ? formData.organizadores.join(", ")
        : formData.responsavel || "";

      const payload = {
        ...formData,
        responsavel: responsavelStr,
        data_fim: formData.data_fim || formData.data_ini,
      };

      if (selectedEvent?.id) {
        const { error: upErr } = await supabase
          .from("events")
          .update(payload as never)
          .eq("id", selectedEvent.id);
        if (upErr) throw upErr;
        await logEventHistory(selectedEvent.id, "Editado", user?.email || "unknown");
        toast.success("Evento atualizado!");
      } else {
        const { data, error: insErr } = await supabase
          .from("events")
          .insert(payload as never)
          .select("id")
          .single();
        if (insErr) throw insErr;
        if (data?.id) await logEventHistory(data.id, "Criado", user?.email || "unknown");
        toast.success("Evento criado!");
      }

      await fetchEvents();
      close();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro ao salvar evento.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;
    if (!confirm(`Excluir o evento "${selectedEvent.evento}"?`)) return;
    try {
      setLoading(true);
      await deleteEvent(selectedEvent.id);
      toast.success("Evento excluído.");
      await fetchEvents();
      close();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={() => !loading && close()}
      />

      <div className="relative bg-surface w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-surface sticky top-0 z-20">
          <h2 className="text-2xl font-black text-text tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-6 bg-accent rounded-full" />
            {selectedEvent ? "Editar Evento" : "Novo Evento"}
          </h2>
          <div className="flex gap-3">
            {selectedEvent && isAdmin && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-bold text-red hover:bg-red/10 rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            )}
            <button
              onClick={close}
              disabled={loading}
              className="p-2.5 rounded-xl hover:bg-surface2 text-muted hover:text-text transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !isAdmin}
              className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-bg/50">
          {error && (
            <div className="mb-6 bg-red/10 text-red p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red/20">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}
          {!isAdmin && (
            <div className="mb-6 bg-amber/10 text-amber p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-amber/20">
              <AlertCircle className="w-5 h-5" /> Modo somente leitura — você não é administrador.
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 pb-8">
            {/* Seção 1 — Identificação */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <SectionHeader index={1} title="Dados identificadores" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Nome do evento *" full>
                  <input name="evento" value={formData.evento || ""} onChange={handleChange} className="input-base" placeholder="Digite o nome do evento..." />
                </Field>
                <Field label="Data início">
                  <input type="date" name="data_ini" value={formData.data_ini || ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Data fim">
                  <input type="date" name="data_fim" value={formData.data_fim || ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Hora início">
                  <input type="time" name="hora_ini" value={formData.hora_ini || ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Hora fim">
                  <input type="time" name="hora_fim" value={formData.hora_fim || ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Tipo de evento">
                  <select name="tipo" value={formData.tipo || ""} onChange={handleChange} className="input-base">
                    <option value="Comercial">Comercial</option>
                    <option value="Comercial Interno">Comercial Interno</option>
                    <option value="Comercial Patrocinado">Comercial Patrocinado</option>
                    <option value="Interno">Interno</option>
                    <option value="Feriado">Feriado</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select name="status" value={formData.status || ""} onChange={handleChange} className="input-base">
                    <option value="Planejado">Planejado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </Field>
                <Field label="Formato">
                  <select name="formato" value={formData.formato || ""} onChange={handleChange} className="input-base">
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </Field>
                <Field label="Cota">
                  <input name="cota" value={formData.cota || ""} onChange={handleChange} className="input-base" />
                </Field>
              </div>
            </section>

            {/* Seção 2 — Localização */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <SectionHeader index={2} title="Localização e links" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Localidade" full>
                  <input name="localidade" value={formData.localidade || ""} onChange={handleChange} className="input-base" placeholder="Local do evento" />
                </Field>
                <Field label="Cidade">
                  <input name="cidade" value={formData.cidade || ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="UF">
                  <input name="uf" value={formData.uf || ""} onChange={handleChange} className="input-base" maxLength={2} />
                </Field>
                <Field label="Links" full>
                  <textarea name="links" value={formData.links || ""} onChange={handleChange} className="input-base min-h-[80px]" placeholder="https://..." />
                </Field>
              </div>
            </section>

            {/* Seção 3 — Organizadores */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <SectionHeader index={3} title="Organizadores" />
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ORGS.map((org) => {
                  const active = (formData.organizadores || []).includes(org);
                  return (
                    <button
                      type="button"
                      key={org}
                      onClick={() => toggleOrg(org)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        active
                          ? "bg-accent text-white border-accent"
                          : "bg-surface2 text-muted border-border hover:text-text"
                      }`}
                    >
                      {org}
                    </button>
                  );
                })}
              </div>
              <Field label="Responsável (livre)" full>
                <input name="responsavel" value={formData.responsavel || ""} onChange={handleChange} className="input-base" placeholder="Caso não esteja na lista acima" />
              </Field>
            </section>

            {/* Seção 4 — Vagas */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <SectionHeader index={4} title="Vagas" />
              <div className="grid grid-cols-3 gap-4">
                <Field label="Staff">
                  <input type="number" name="vagas_staff" value={formData.vagas_staff ?? 0} onChange={handleChange} className="input-base" min={0} />
                </Field>
                <Field label="Clientes">
                  <input type="number" name="vagas_cliente" value={formData.vagas_cliente ?? 0} onChange={handleChange} className="input-base" min={0} />
                </Field>
                <Field label="VIPs">
                  <input type="number" name="vagas_vip" value={formData.vagas_vip ?? 0} onChange={handleChange} className="input-base" min={0} />
                </Field>
              </div>
            </section>

            {/* Seção 5 — Conteúdo */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <SectionHeader index={5} title="Conteúdo e observações" />
              <Field label="Público" full>
                <input name="publico" value={formData.publico || ""} onChange={handleChange} className="input-base" />
              </Field>
              <Field label="Participantes (texto livre)" full>
                <textarea name="participantes" value={formData.participantes || ""} onChange={handleChange} className="input-base min-h-[80px]" />
              </Field>
              <Field label="Benefícios" full>
                <textarea name="beneficios" value={formData.beneficios || ""} onChange={handleChange} className="input-base min-h-[80px]" />
              </Field>
              <Field label="Descrição" full>
                <textarea name="descricao" value={formData.descricao || ""} onChange={handleChange} className="input-base min-h-[80px]" />
              </Field>
              <Field label="Observações" full>
                <textarea name="obs" value={formData.obs || ""} onChange={handleChange} className="input-base min-h-[80px]" />
              </Field>
            </section>

            {/* Seção 6 — Financeiro */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <SectionHeader index={6} title="Financeiro" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Tipo financeiro">
                  <select name="tipo_financeiro" value={formData.tipo_financeiro || ""} onChange={handleChange} className="input-base">
                    <option value="">—</option>
                    <option value="Receita">Receita</option>
                    <option value="Custo">Custo</option>
                    <option value="Investimento">Investimento</option>
                    <option value="Patrocínio">Patrocínio</option>
                  </select>
                </Field>
                <Field label="Orçamento total">
                  <input type="number" step="0.01" name="orcamento_total" value={formData.orcamento_total ?? ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Receita estimada">
                  <input type="number" step="0.01" name="receita_estimada" value={formData.receita_estimada ?? ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Previsão pipe">
                  <input type="number" step="0.01" name="previsao_pipe" value={formData.previsao_pipe ?? ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Previsão de fechamento">
                  <input type="number" step="0.01" name="previsao_fechamento" value={formData.previsao_fechamento ?? ""} onChange={handleChange} className="input-base" />
                </Field>
                <Field label="Custo real apurado">
                  <input type="number" step="0.01" name="custo_real" value={formData.custo_real ?? ""} onChange={handleChange} className="input-base" />
                </Field>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Custos por categoria</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <Field label="Brindes">
                    <input type="number" step="0.01" name="custo_brindes" value={formData.custo_brindes ?? ""} onChange={handleChange} className="input-base" />
                  </Field>
                  <Field label="Uniformes">
                    <input type="number" step="0.01" name="custo_uniformes" value={formData.custo_uniformes ?? ""} onChange={handleChange} className="input-base" />
                  </Field>
                  <Field label="Ingressos">
                    <input type="number" step="0.01" name="custo_ingressos" value={formData.custo_ingressos ?? ""} onChange={handleChange} className="input-base" />
                  </Field>
                  <Field label="Passagens">
                    <input type="number" step="0.01" name="custo_passagens" value={formData.custo_passagens ?? ""} onChange={handleChange} className="input-base" />
                  </Field>
                  <Field label="Hospedagem">
                    <input type="number" step="0.01" name="custo_hospedagem" value={formData.custo_hospedagem ?? ""} onChange={handleChange} className="input-base" />
                  </Field>
                  <Field label="Outros (resumo)">
                    <input type="number" step="0.01" name="custo_outros" value={formData.custo_outros ?? ""} onChange={handleChange} className="input-base" />
                  </Field>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-muted uppercase tracking-widest">Outros custos detalhados</h4>
                  <button
                    type="button"
                    onClick={addOutro}
                    className="flex items-center gap-1.5 text-xs font-bold text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                {outros.length === 0 ? (
                  <p className="text-xs text-muted italic">Nenhum custo adicional cadastrado.</p>
                ) : (
                  <div className="space-y-2">
                    {outros.map((o) => (
                      <div key={o.id} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          className="input-base col-span-3"
                          placeholder="Nome"
                          value={o.nome}
                          onChange={(e) => updateOutro(o.id, { nome: e.target.value })}
                        />
                        <input
                          className="input-base col-span-6"
                          placeholder="Descrição"
                          value={o.descricao}
                          onChange={(e) => updateOutro(o.id, { descricao: e.target.value })}
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="input-base col-span-2"
                          placeholder="0,00"
                          value={o.valor}
                          onChange={(e) => updateOutro(o.id, { valor: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => removeOutro(o.id)}
                          className="col-span-1 p-2 text-muted hover:text-red hover:bg-red/10 rounded-lg transition-colors flex items-center justify-center"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <Totalizer label="Custos categorias" value={fmtBRL(totalCustosFixos)} />
                <Totalizer label="Outros custos" value={fmtBRL(totalOutros)} />
                <Totalizer label="Custo total" value={fmtBRL(custoTotal)} accent />
                <Totalizer
                  label="Margem estimada"
                  value={fmtBRL(margem)}
                  tone={margem >= 0 ? "positive" : "negative"}
                />
              </div>

              <label className="flex items-center gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="apuracao_finalizada"
                  checked={!!formData.apuracao_finalizada}
                  onChange={handleChange}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm font-bold text-text">Apuração finalizada</span>
              </label>
            </section>

            {/* Seção 7 — Brindes alocados */}
            <section className="bg-surface p-8 rounded-2xl border border-border space-y-6">
              <div className="flex items-center justify-between">
                <SectionHeader index={7} title="Brindes alocados" />
                <button
                  type="button"
                  onClick={addBrinde}
                  className="flex items-center gap-1.5 text-xs font-bold text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {brindes.length === 0 ? (
                <p className="text-xs text-muted italic">Nenhum brinde alocado para este evento.</p>
              ) : (
                <div className="space-y-2">
                  {brindes.map((b) => {
                    const matched = inventoryItems.find((i) => i.id === b.docId);
                    const disponivel = matched ? (matched.qtd_total || 0) - (matched.qtd_reservada || 0) : null;
                    return (
                      <div key={b.id} className="grid grid-cols-12 gap-2 items-center">
                        <select
                          className="input-base col-span-6"
                          value={b.docId || ""}
                          onChange={(e) => {
                            const item = inventoryItems.find((i) => i.id === e.target.value);
                            updateBrinde(b.id!, {
                              docId: e.target.value,
                              item: item?.nome || b.item,
                              _collection: "inventory_items",
                            });
                          }}
                        >
                          <option value="">— item livre —</option>
                          {inventoryItems.map((i) => (
                            <option key={i.id} value={i.id}>{i.nome} ({i.categoria})</option>
                          ))}
                        </select>
                        <input
                          className="input-base col-span-3"
                          placeholder="Item (livre)"
                          value={b.item}
                          onChange={(e) => updateBrinde(b.id!, { item: e.target.value })}
                        />
                        <input
                          type="number"
                          className="input-base col-span-2"
                          min={1}
                          value={b.qtd}
                          onChange={(e) => updateBrinde(b.id!, { qtd: Number(e.target.value) })}
                        />
                        <button
                          type="button"
                          onClick={() => removeBrinde(b.id!)}
                          className="col-span-1 p-2 text-muted hover:text-red hover:bg-red/10 rounded-lg transition-colors flex items-center justify-center"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {disponivel !== null && (
                          <div className="col-span-12 -mt-1 ml-1 text-[10px] font-bold text-muted">
                            Disponível no estoque: <span className={disponivel < b.qtd ? "text-red" : "text-emerald-500"}>{disponivel}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-black">
        {index}
      </div>
      <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em]">{title}</h3>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

function Totalizer({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-500"
      : tone === "negative"
      ? "text-red"
      : accent
      ? "text-accent"
      : "text-text";
  return (
    <div className="bg-bg/50 border border-border rounded-xl p-3">
      <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-base font-black ${toneClass}`}>{value}</div>
    </div>
  );
}