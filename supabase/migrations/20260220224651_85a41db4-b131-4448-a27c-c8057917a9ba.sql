
CREATE OR REPLACE FUNCTION public.get_missed_market_opportunities(
  target_brokerage text,
  state_filter text DEFAULT NULL
)
RETURNS TABLE(market text, peer_count bigint, top_peers text[], total_peer_mentions bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH target_markets AS (
    SELECT DISTINCT p.primary_market
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
      AND p.primary_market IS NOT NULL
      AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
  ),
  peer_market_mentions AS (
    SELECT 
      p.primary_market,
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
      COUNT(*) AS mentions
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE p.primary_market IS NOT NULL
      AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
      AND p.primary_market NOT IN (SELECT primary_market FROM target_markets)
      AND COALESCE(e.normalized_brokerage, e.brokerage, e.name) != target_brokerage
    GROUP BY p.primary_market, COALESCE(e.normalized_brokerage, e.brokerage, e.name)
  )
  SELECT 
    pmm.primary_market AS market,
    COUNT(DISTINCT pmm.brokerage) AS peer_count,
    (ARRAY_AGG(pmm.brokerage ORDER BY pmm.mentions DESC))[1:3] AS top_peers,
    SUM(pmm.mentions) AS total_peer_mentions
  FROM peer_market_mentions pmm
  GROUP BY pmm.primary_market
  ORDER BY total_peer_mentions DESC
  LIMIT 20;
$function$;
