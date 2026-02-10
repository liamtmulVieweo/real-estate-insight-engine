-- Add normalized_brokerage column to lovable_entities
ALTER TABLE public.lovable_entities
ADD COLUMN normalized_brokerage text;

-- Index for faster lookups by normalized name
CREATE INDEX idx_lovable_entities_normalized_brokerage ON public.lovable_entities (normalized_brokerage);