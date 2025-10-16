-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create commodity prices table
CREATE TABLE public.commodity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'per metric ton',
  change_percentage DECIMAL(5,2),
  trend TEXT CHECK (trend IN ('up', 'down')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create CAD uploads table
CREATE TABLE public.cad_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  material_type TEXT,
  estimated_volume DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cad_upload_id UUID REFERENCES public.cad_uploads(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  material TEXT NOT NULL,
  process TEXT NOT NULL,
  material_cost DECIMAL(10,2) NOT NULL,
  fabrication_cost DECIMAL(10,2) NOT NULL,
  overhead_cost DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodity_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cad_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Commodity prices policies (public read)
CREATE POLICY "Anyone can view commodity prices"
  ON public.commodity_prices FOR SELECT
  TO authenticated
  USING (true);

-- CAD uploads policies
CREATE POLICY "Users can view their own uploads"
  ON public.cad_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads"
  ON public.cad_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Quotes policies
CREATE POLICY "Users can view their own quotes"
  ON public.quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotes"
  ON public.quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes"
  ON public.quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for CAD files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-files', 'cad-files', false);

-- Storage policies for CAD files
CREATE POLICY "Users can upload their own CAD files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cad-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own CAD files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cad-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial commodity prices
INSERT INTO public.commodity_prices (name, price, unit, change_percentage, trend) VALUES
  ('Steel Rebar', 725.50, 'per metric ton', 2.3, 'up'),
  ('Aluminum', 2450.00, 'per metric ton', -0.8, 'down'),
  ('Copper', 8920.00, 'per metric ton', 1.5, 'up'),
  ('Stainless Steel', 1875.00, 'per metric ton', 0.4, 'up');