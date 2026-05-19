export interface InventoryItem {
  id: string;
  nome: string;
  categoria: string;
  unidade: string | null;
  qtd_total: number;
  qtd_reservada: number;
  custo_unitario: number | null;
  fornecedor: string | null;
  localizacao: string | null;
  foto_url: string | null;
  obs: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORIAS_ALMOX = [
  "Brinde",
  "Uniforme",
  "Material",
  "Equipamento",
  "Decoração",
  "Outros",
];