import { useEffect, useState } from "react";
import { X, Save, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/useAuth";
import { useEvents } from "@/store/useEvents";
import { deleteEvent, logEventHistory } from "@/lib/eventActions";
import type { TriplaEvent } from "@/types/evento";

const DEFAULT_ORGS = ["Gente & Gestão", "Jessica Alves (SP)", "Jessica Andrade (BH)", "Marketing"];

type FormState = Partial<TriplaEvent> & { evento: string; data_ini: string };

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

  const [formData, setFormData] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditingEvent) return;
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
  }, [isEditingEvent, selectedEvent]);

  if (!isEditingEvent) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

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