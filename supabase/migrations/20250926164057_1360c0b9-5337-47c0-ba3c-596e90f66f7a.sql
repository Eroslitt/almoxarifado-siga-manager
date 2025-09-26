-- Create table for material requests
CREATE TABLE public.material_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_number TEXT NOT NULL UNIQUE,
  requester_name TEXT NOT NULL,
  department TEXT,
  project_code TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  total_estimated_value DECIMAL(10,2) DEFAULT 0,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivered_by TEXT,
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for material requests
CREATE POLICY "Users can view their own requests" 
ON public.material_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" 
ON public.material_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.material_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to generate request number
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(request_number FROM 'REQ-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-(.*)') 
      AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.material_requests
  WHERE request_number LIKE 'REQ-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
  
  -- Format as REQ-YYYYMMDD-NNNN
  formatted_number := 'REQ-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_material_requests_updated_at
BEFORE UPDATE ON public.material_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();