-- Add labor cost fields to quotes table
ALTER TABLE quotes
ADD COLUMN labor_hours numeric,
ADD COLUMN labor_rate numeric DEFAULT 25.00,
ADD COLUMN labor_cost numeric;