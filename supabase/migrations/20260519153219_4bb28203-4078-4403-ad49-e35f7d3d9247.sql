
-- Inventory (Almoxarifado): itens cadastrados e alocações por evento
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Brinde',
  unidade TEXT DEFAULT 'un',
  qtd_total INTEGER NOT NULL DEFAULT 0,
  qtd_reservada INTEGER NOT NULL DEFAULT 0,
  custo_unitario NUMERIC DEFAULT 0,
  fornecedor TEXT,
  localizacao TEXT,
  foto_url TEXT,
  obs TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert inventory" ON public.inventory_items
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inventory" ON public.inventory_items
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete inventory" ON public.inventory_items
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER inventory_items_touch_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_inventory_categoria ON public.inventory_items(categoria);
CREATE INDEX idx_inventory_ativo ON public.inventory_items(ativo);
