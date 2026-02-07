-- Update function to include property_type_filter parameter
DROP FUNCTION IF EXISTS public.get_broker_team_breakdown(text, text);

CREATE FUNCTION public.get_broker_team_breakdown(
  target_brokerage text,
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL
)
RETURNS TABLE(
  broker_name text,
  property_types text[],
  mentions bigint,
  global_rank bigint,
  total_brokers bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Input validation
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;

  RETURN QUERY
  WITH broker_mentions AS (
    -- Aggregate total mentions and property types per broker for the target brokerage
    SELECT
      e.name AS broker,
      ARRAY_AGG(DISTINCT p.property_type ORDER BY p.property_type) AS prop_types,
      COUNT(*)::bigint AS mention_count
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      COALESCE(e.brokerage, e.name) = target_brokerage
      AND e.entity_type = 'broker'
      AND e.name IS NOT NULL
      AND p.property_type IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
      AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    GROUP BY e.name
  ),
  global_broker_totals AS (
    -- Calculate total mentions per broker across ALL brokerages
    -- When property_type_filter is set, rank by mentions in that property type only
    SELECT
      e.name AS broker,
      COUNT(*)::bigint AS total_mentions
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      e.entity_type = 'broker'
      AND e.name IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
      AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    GROUP BY e.name
  ),
  global_broker_rankings AS (
    -- Rank brokers by their total mentions
    SELECT
      gbt.broker,
      gbt.total_mentions,
      RANK() OVER (ORDER BY gbt.total_mentions DESC)::bigint AS rnk,
      COUNT(*) OVER ()::bigint AS broker_count
    FROM global_broker_totals gbt
  )
  SELECT
    bm.broker AS broker_name,
    bm.prop_types AS property_types,
    bm.mention_count AS mentions,
    COALESCE(gbr.rnk, 0) AS global_rank,
    COALESCE(gbr.broker_count, 0) AS total_brokers
  FROM broker_mentions bm
  LEFT JOIN global_broker_rankings gbr ON bm.broker = gbr.broker
  ORDER BY gbr.rnk, bm.mention_count DESC, bm.broker;
END;
$function$;