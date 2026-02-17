
CREATE OR REPLACE FUNCTION public.get_co_mention_details(
  target_brokerage text,
  peer_brokerage text
)
RETURNS TABLE(
  prompt_hash text,
  prompt text,
  market text,
  property_type text,
  broker_role text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF peer_brokerage IS NULL OR LENGTH(peer_brokerage) = 0 THEN
    RAISE EXCEPTION 'peer_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;
  IF LENGTH(peer_brokerage) > 200 THEN
    RAISE EXCEPTION 'peer_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH target_prompts AS (
    SELECT DISTINCT e.prompt_hash
    FROM lovable_entities e
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
  ),
  peer_prompts AS (
    SELECT DISTINCT e.prompt_hash
    FROM lovable_entities e
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = peer_brokerage
  ),
  shared_prompts AS (
    SELECT tp.prompt_hash
    FROM target_prompts tp
    INNER JOIN peer_prompts pp ON tp.prompt_hash = pp.prompt_hash
  )
  SELECT
    p.prompt_hash,
    p.prompt,
    COALESCE(p.primary_market, p.submarket, p.market) AS market,
    p.property_type,
    p.broker_role
  FROM lovable_prompts p
  WHERE p.prompt_hash IN (SELECT sp.prompt_hash FROM shared_prompts sp)
  ORDER BY p.citation_count DESC NULLS LAST
  LIMIT 10;
END;
$function$;
