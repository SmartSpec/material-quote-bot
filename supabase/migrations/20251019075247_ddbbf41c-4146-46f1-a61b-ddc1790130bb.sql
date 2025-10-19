-- Create pressure_vessel_uploads table
CREATE TABLE IF NOT EXISTS public.pressure_vessel_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  wall_thickness NUMERIC,
  radius NUMERIC,
  height NUMERIC,
  unit TEXT DEFAULT 'inches',
  analyzed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pressure_vessel_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own uploads"
  ON public.pressure_vessel_uploads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads"
  ON public.pressure_vessel_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON public.pressure_vessel_uploads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for pressure vessel PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pressure-vessel-pdfs', 'pressure-vessel-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'pressure-vessel-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own PDFs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'pressure-vessel-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own PDFs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'pressure-vessel-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );