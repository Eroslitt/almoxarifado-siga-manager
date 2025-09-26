-- Create SKUs table for stock management
CREATE TABLE public.skus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sku_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'piece',
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 100,
  location TEXT,
  last_movement_date DATE,
  classification TEXT CHECK (classification IN ('A', 'B', 'C')) DEFAULT 'C',
  status TEXT CHECK (status IN ('active', 'inactive', 'critical', 'normal', 'warning')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;

-- Create policies for SKUs
CREATE POLICY "Users can view their own SKUs" 
ON public.skus 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SKUs" 
ON public.skus 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SKUs" 
ON public.skus 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SKUs" 
ON public.skus 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_skus_updated_at
BEFORE UPDATE ON public.skus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create stock movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  movement_type TEXT CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC,
  reference_document TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for stock movements
CREATE POLICY "Users can view their own stock movements" 
ON public.stock_movements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stock movements" 
ON public.stock_movements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert sample data for testing
INSERT INTO public.skus (user_id, sku_code, name, description, category, unit, current_stock, min_stock, max_stock, location, classification, status)
SELECT 
  auth.uid(),
  'SKU001',
  'Parafuso M6 x 20mm',
  'Parafuso sextavado M6 x 20mm galvanizado',
  'Ferramentas',
  'piece',
  150,
  100,
  500,
  'A-01-03-C',
  'A',
  'normal'
WHERE auth.uid() IS NOT NULL;

INSERT INTO public.skus (user_id, sku_code, name, description, category, unit, current_stock, min_stock, max_stock, location, classification, status)
SELECT 
  auth.uid(),
  'SKU002',
  'Capacitor 220µF',
  'Capacitor eletrolítico 220µF x 25V',
  'Eletrônicos',
  'piece',
  25,
  50,
  200,
  'B-02-01-A',
  'B',
  'critical'
WHERE auth.uid() IS NOT NULL;

INSERT INTO public.skus (user_id, sku_code, name, description, category, unit, current_stock, min_stock, max_stock, location, classification, status)
SELECT 
  auth.uid(),
  'SKU003',
  'Luva de Segurança P',
  'Luva de segurança tamanho P - látex',
  'EPI',
  'piece',
  80,
  30,
  150,
  'C-03-02-B',
  'C',
  'normal'
WHERE auth.uid() IS NOT NULL;