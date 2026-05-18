CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento text NOT NULL,
  data_ini date NOT NULL,
  data_fim date,
  hora_ini text,
  hora_fim text,
  responsavel text DEFAULT '',
  status text NOT NULL DEFAULT 'Planejado',
  tipo text NOT NULL DEFAULT 'Comercial',
  formato text DEFAULT 'Presencial',
  descricao text,
  cota text,
  localidade text,
  uf text,
  cidade text,
  links text,
  conteudo text,
  materiais text,
  publico text,
  participantes text,
  beneficios text,
  obs text,

  tipo_financeiro text,
  apuracao_finalizada boolean DEFAULT false,
  custo_real numeric,
  previsao_pipe numeric,
  previsao_fechamento numeric,
  receita_estimada numeric,
  orcamento_total numeric,
  custo_brindes numeric,
  custo_uniformes numeric,
  custo_ingressos numeric,
  custo_passagens numeric,
  custo_hospedagem numeric,
  custo_outros numeric,
  outros_custos_lista jsonb DEFAULT '[]'::jsonb,

  vagas_staff integer DEFAULT 0,
  vagas_cliente integer DEFAULT 0,
  vagas_vip integer DEFAULT 0,

  organizadores jsonb DEFAULT '[]'::jsonb,
  equipe jsonb DEFAULT '[]'::jsonb,
  clientes jsonb DEFAULT '[]'::jsonb,
  vips jsonb DEFAULT '[]'::jsonb,
  brindes_alocados jsonb DEFAULT '[]'::jsonb,
  historico jsonb DEFAULT '[]'::jsonb,
  comentarios jsonb DEFAULT '[]'::jsonb,
  arquivos jsonb DEFAULT '[]'::jsonb,

  estoque_baixa_processada boolean DEFAULT false,

  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_data_ini ON public.events(data_ini);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_tipo ON public.events(tipo);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read events"
ON public.events FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins insert events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update events"
ON public.events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete events"
ON public.events FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();