
-- Fix search_path for the new SQL-language function
CREATE OR REPLACE FUNCTION public.get_property_type_breakdown(
  target_brokerage text,
  market_filter text DEFAULT NULL,
  state_filter text DEFAULT NULL
)
RETURNS TABLE(property_type text, mentions bigint, rank bigint, total_brokerages bigint)
LANGUAGE sql STABLE
SET search_path = 'public'
AS $$
  WITH all_brokerage_property_counts AS (
    SELECT
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
      p.property_type,
      COUNT(*)::bigint AS mentions
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE p.property_type IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
      AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
    GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name), p.property_type
  ),
  ranked_brokerages AS (
    SELECT brokerage, property_type, mentions,
      RANK() OVER (PARTITION BY property_type ORDER BY mentions DESC)::bigint AS brokerage_rank,
      COUNT(*) OVER (PARTITION BY property_type)::bigint AS total_brokerages
    FROM all_brokerage_property_counts
  )
  SELECT rb.property_type, rb.mentions, rb.brokerage_rank AS rank, rb.total_brokerages
  FROM ranked_brokerages rb
  WHERE rb.brokerage = target_brokerage
  ORDER BY rb.mentions DESC;
$$;
