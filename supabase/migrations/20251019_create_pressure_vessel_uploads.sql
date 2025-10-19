-- Create pressure_vessel_uploads table
CREATE TABLE IF NOT EXISTS public.pressure_vessel_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  radius DOUBLE PRECISION,
  height DOUBLE PRECISION,
  wall_thickness DOUBLE PRECISION,
  unit TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pressure_vessel_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own uploads"
  ON public.pressure_vessel_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON public.pressure_vessel_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON public.pressure_vessel_uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON public.pressure_vessel_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS pressure_vessel_uploads_user_id_idx ON public.pressure_vessel_uploads(user_id);
CREATE INDEX IF NOT EXISTS pressure_vessel_uploads_created_at_idx ON public.pressure_vessel_uploads(created_at DESC);
