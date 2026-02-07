
CREATE OR REPLACE FUNCTION public.get_primary_markets_for_brokerage(target_brokerage text)
RETURNS TABLE(primary_market text)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT DISTINCT p.primary_market
  FROM lovable_prompts p
  JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
  WHERE COALESCE(e.brokerage, e.name) = target_brokerage
    AND p.primary_market IS NOT NULL
  ORDER BY p.primary_market;
$$;
