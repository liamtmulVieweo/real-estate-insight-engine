-- Make required columns nullable to allow import of partial data
ALTER TABLE public.visibility_records ALTER COLUMN entity_type DROP NOT NULL;
ALTER TABLE public.visibility_records ALTER COLUMN property_type DROP NOT NULL;
ALTER TABLE public.visibility_records ALTER COLUMN broker_role DROP NOT NULL;