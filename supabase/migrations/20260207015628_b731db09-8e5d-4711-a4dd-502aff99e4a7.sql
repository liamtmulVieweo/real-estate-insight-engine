
CREATE OR REPLACE FUNCTION public.get_property_type_breakdown(target_brokerage text)
RETURNS TABLE(
  property_type text,
  mentions bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH property_counts AS (
    SELECT 
      p.property_type,
      COUNT(*)::bigint AS mentions
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.brokerage, e.name) = target_brokerage
      AND p.property_type IS NOT NULL
    GROUP BY p.property_type
  )
  SELECT 
    pc.property_type,
    pc.mentions,
    RANK() OVER (ORDER BY pc.mentions DESC)::bigint AS rank
  FROM property_counts pc
  ORDER BY pc.mentions DESC;
$$;
