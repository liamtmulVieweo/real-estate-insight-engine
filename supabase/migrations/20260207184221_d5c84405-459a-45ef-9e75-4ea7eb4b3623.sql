-- Update function to rank brokers by total mentions overall (not per property type)
CREATE OR REPLACE FUNCTION public.get_broker_team_breakdown(
  target_brokerage text,
  market_filter text DEFAULT NULL
)
RETURNS TABLE(
  broker_name text,
  property_type text,
  mentions bigint,
  global_rank bigint
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
  WITH broker_property_mentions AS (
    -- Aggregate mentions per broker per property type for the target brokerage
    SELECT
      e.name AS broker,
      p.property_type AS prop_type,
      COUNT(*)::bigint AS mention_count
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      COALESCE(e.brokerage, e.name) = target_brokerage
      AND e.entity_type = 'broker'
      AND e.name IS NOT NULL
      AND p.property_type IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
    GROUP BY e.name, p.property_type
  ),
  global_broker_totals AS (
    -- Calculate total mentions per broker across ALL brokerages (for global ranking)
    SELECT
      e.name AS broker,
      COUNT(*)::bigint AS total_mentions
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      e.entity_type = 'broker'
      AND e.name IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
    GROUP BY e.name
  ),
  global_broker_rankings AS (
    -- Rank brokers by their total mentions overall
    SELECT
      gbt.broker,
      gbt.total_mentions,
      RANK() OVER (ORDER BY gbt.total_mentions DESC)::bigint AS rnk
    FROM global_broker_totals gbt
  )
  SELECT
    bpm.broker AS broker_name,
    bpm.prop_type AS property_type,
    bpm.mention_count AS mentions,
    COALESCE(gbr.rnk, 0) AS global_rank
  FROM broker_property_mentions bpm
  LEFT JOIN global_broker_rankings gbr ON bpm.broker = gbr.broker
  ORDER BY gbr.rnk, bpm.mention_count DESC, bpm.broker, bpm.prop_type;
END;
$function$;