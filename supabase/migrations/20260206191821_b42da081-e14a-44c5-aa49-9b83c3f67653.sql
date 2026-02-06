
CREATE OR REPLACE FUNCTION public.get_missed_market_opportunities(target_brokerage text)
RETURNS TABLE(
  market text,
  peer_count bigint,
  top_peers text[],
  total_peer_mentions bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH target_markets AS (
    -- Markets where the target brokerage appears (using primary_market)
    SELECT DISTINCT p.primary_market
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.brokerage, e.name) = target_brokerage
      AND p.primary_market IS NOT NULL
  ),
  peer_market_mentions AS (
    -- Count peer mentions in markets where target is NOT present (using primary_market)
    SELECT 
      p.primary_market,
      COALESCE(e.brokerage, e.name) AS brokerage,
      COUNT(*) AS mentions
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE p.primary_market IS NOT NULL
      AND p.primary_market NOT IN (SELECT primary_market FROM target_markets)
      AND COALESCE(e.brokerage, e.name) != target_brokerage
    GROUP BY p.primary_market, COALESCE(e.brokerage, e.name)
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
$$;
