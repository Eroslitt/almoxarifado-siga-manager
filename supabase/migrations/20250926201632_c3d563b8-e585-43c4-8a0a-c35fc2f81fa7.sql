-- FASE 1: Criar tabelas essenciais faltantes

-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de fornecedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  ie TEXT,
  address JSONB NOT NULL DEFAULT '{}',
  contact_info JSONB NOT NULL DEFAULT '{}',
  payment_terms TEXT,
  lead_time_days INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de localizações de armazenamento
CREATE TABLE public.storage_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  street TEXT NOT NULL,
  shelf TEXT NOT NULL,
  level TEXT NOT NULL,
  position TEXT NOT NULL,
  capacity INTEGER,
  restrictions TEXT[],
  zone_type TEXT NOT NULL DEFAULT 'storage' CHECK (zone_type IN ('picking', 'storage', 'staging', 'quarantine')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'blocked', 'maintenance')),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ferramentas/equipamentos
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  brand TEXT,
  model TEXT,
  serial_number TEXT UNIQUE,
  qr_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'inactive')),
  location_id UUID REFERENCES public.storage_locations(id),
  current_user_id UUID,
  purchase_date DATE,
  purchase_value NUMERIC(10,2),
  supplier_id UUID REFERENCES public.suppliers(id),
  warranty_expiry DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  maintenance_interval_days INTEGER DEFAULT 365,
  specifications JSONB DEFAULT '{}',
  photo_url TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de movimentações de ferramentas
CREATE TABLE public.tool_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('checkout', 'checkin', 'maintenance', 'transfer')),
  performed_by_user_id UUID NOT NULL,
  assigned_to_user_id UUID,
  from_location_id UUID REFERENCES public.storage_locations(id),
  to_location_id UUID REFERENCES public.storage_locations(id),
  notes TEXT,
  expected_return_date TIMESTAMP WITH TIME ZONE,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  condition_before TEXT,
  condition_after TEXT,
  signature_data TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de níveis de estoque (complementa a tabela skus existente)
CREATE TABLE public.stock_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.storage_locations(id),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  last_movement_date TIMESTAMP WITH TIME ZONE,
  last_count_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sku_id, location_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para suppliers
CREATE POLICY "Users can view their own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para storage_locations
CREATE POLICY "Users can view their own storage locations" ON public.storage_locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own storage locations" ON public.storage_locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own storage locations" ON public.storage_locations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own storage locations" ON public.storage_locations FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para tools
CREATE POLICY "Users can view their own tools" ON public.tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tools" ON public.tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tools" ON public.tools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tools" ON public.tools FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para tool_movements
CREATE POLICY "Users can view their own tool movements" ON public.tool_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tool movements" ON public.tool_movements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para stock_levels
CREATE POLICY "Users can view their own stock levels" ON public.stock_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own stock levels" ON public.stock_levels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stock levels" ON public.stock_levels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stock levels" ON public.stock_levels FOR DELETE USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_storage_locations_updated_at BEFORE UPDATE ON public.storage_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON public.stock_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar stock automaticamente
CREATE OR REPLACE FUNCTION public.update_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar stock_levels baseado na movimentação
  INSERT INTO public.stock_levels (sku_id, location_id, current_quantity, user_id)
  VALUES (NEW.sku_id, 
          COALESCE((SELECT id FROM public.storage_locations WHERE user_id = NEW.user_id LIMIT 1), 
                   (SELECT id FROM public.storage_locations WHERE user_id = NEW.user_id ORDER BY created_at DESC LIMIT 1)),
          CASE WHEN NEW.movement_type = 'in' THEN NEW.quantity ELSE -NEW.quantity END,
          NEW.user_id)
  ON CONFLICT (sku_id, location_id) 
  DO UPDATE SET 
    current_quantity = stock_levels.current_quantity + CASE WHEN NEW.movement_type = 'in' THEN NEW.quantity ELSE -NEW.quantity END,
    last_movement_date = NEW.created_at,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar stock automaticamente com movimentações
CREATE TRIGGER auto_update_stock_levels
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_from_movement();

-- Atualizar foreign keys na tabela skus para referenciar as novas tabelas
ALTER TABLE public.skus ADD COLUMN category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.skus ADD COLUMN default_supplier_id UUID REFERENCES public.suppliers(id);
ALTER TABLE public.skus ADD COLUMN alternative_suppliers UUID[] DEFAULT '{}';

-- Índices para performance
CREATE INDEX idx_tools_status ON public.tools(status);
CREATE INDEX idx_tools_category ON public.tools(category_id);
CREATE INDEX idx_tools_current_user ON public.tools(current_user_id);
CREATE INDEX idx_tool_movements_tool_id ON public.tool_movements(tool_id);
CREATE INDEX idx_tool_movements_timestamp ON public.tool_movements(timestamp);
CREATE INDEX idx_stock_levels_sku_location ON public.stock_levels(sku_id, location_id);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_suppliers_status ON public.suppliers(status);