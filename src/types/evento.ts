export interface EquipeMember {
  nome: string;
  funcao?: string;
  tamanho?: string;
}
export interface ClienteMember {
  nome: string;
  empresa?: string;
}
export interface VipMember {
  nome: string;
  obs?: string;
}
export interface BrindeAlocado {
  id?: string;
  item: string;
  qtd: number;
  docId?: string;
  _collection?: string;
}
export interface HistoricoEntry {
  editor: string;
  data: string;
  acao: string;
  status?: string;
  tipo?: string;
}
export interface Comentario {
  autor: string;
  texto: string;
  data: string;
}

export interface TriplaEvent {
  id: string;
  evento: string;
  data_ini: string;
  data_fim?: string;
  hora_ini?: string;
  hora_fim?: string;
  responsavel: string;
  status: string;
  tipo: string;
  formato?: string;
  descricao?: string;

  cota?: string;
  localidade?: string;
  uf?: string;
  cidade?: string;
  links?: string;
  conteudo?: string;
  materiais?: string;
  publico?: string;
  participantes?: string;
  beneficios?: string;
  obs?: string;

  tipo_financeiro?: string;
  apuracao_finalizada?: boolean;
  custo_real?: number | string;
  previsao_pipe?: number | string;
  previsao_fechamento?: number | string;
  receita_estimada?: number | string;
  orcamento_total?: number | string;
  custo_brindes?: number | string;
  custo_uniformes?: number | string;
  custo_ingressos?: number | string;
  custo_passagens?: number | string;
  custo_hospedagem?: number | string;
  custo_outros?: number | string;
  outros_custos_lista?: { id: string; nome: string; descricao: string; valor: number | string }[];

  vagas_staff?: number;
  vagas_cliente?: number;
  vagas_vip?: number;

  organizadores?: string[];
  equipe?: EquipeMember[];
  clientes?: ClienteMember[];
  vips?: VipMember[];
  brindes_alocados?: BrindeAlocado[];
  historico?: HistoricoEntry[];
  comentarios?: Comentario[];
  arquivos?: { nome: string; url: string; tipo: string }[];

  estoque_baixa_processada?: boolean;

  created_at?: string;
  updated_at?: string;
}