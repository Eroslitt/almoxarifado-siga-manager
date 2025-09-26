-- Create patrimônios table
CREATE TABLE public.patrimonios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  codigo_patrimonio TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  valor_aquisicao NUMERIC,
  data_aquisicao DATE,
  fornecedor TEXT,
  localizacao TEXT,
  responsavel TEXT,
  estado_conservacao TEXT NOT NULL DEFAULT 'bom',
  status TEXT NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  foto_url TEXT,
  etiqueta_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patrimonios ENABLE ROW LEVEL SECURITY;

-- Create policies for patrimônios
CREATE POLICY "Users can view their own patrimônios" 
ON public.patrimonios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patrimônios" 
ON public.patrimonios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patrimônios" 
ON public.patrimonios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patrimônios" 
ON public.patrimonios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patrimonios_updated_at
BEFORE UPDATE ON public.patrimonios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate patrimônio code
CREATE OR REPLACE FUNCTION public.generate_patrimonio_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  next_number INTEGER;
  formatted_code TEXT;
BEGIN
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(codigo_patrimonio FROM 'PAT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-(.*)') 
      AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.patrimonios
  WHERE codigo_patrimonio LIKE 'PAT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%';
  
  -- Format as PAT-YYYY-NNNN
  formatted_code := 'PAT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN formatted_code;
END;
$function$