-- Fix: When showing brokerage-specific mentions, rank should be based on those same mentions
-- The rank compares the target brokerage's brokers against ALL brokers' total mentions in that filter
DROP FUNCTION IF EXISTS public.get_broker_team_breakdown(text, text, text);

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
  WITH all_broker_mentions AS (
    -- Get ALL brokers' mentions (for global ranking comparison)
    SELECT
      e.name AS broker,
      COALESCE(e.brokerage, e.name) AS brokerage,
      COUNT(*)::bigint AS mention_count
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      e.entity_type = 'broker'
      AND e.name IS NOT NULL
      AND p.property_type IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
      AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    GROUP BY e.name, COALESCE(e.brokerage, e.name)
  ),
  global_rankings AS (
    -- Rank ALL brokers by their mentions
    SELECT
      abm.broker,
      abm.brokerage,
      abm.mention_count,
      RANK() OVER (ORDER BY abm.mention_count DESC)::bigint AS rnk,
      COUNT(*) OVER ()::bigint AS broker_count
    FROM all_broker_mentions abm
  ),
  target_brokers AS (
    -- Get property types for target brokerage's brokers
    SELECT
      e.name AS broker,
      ARRAY_AGG(DISTINCT p.property_type ORDER BY p.property_type) AS prop_types
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
  )
  SELECT
    gr.broker AS broker_name,
    COALESCE(tb.prop_types, '{}'::text[]) AS property_types,
    gr.mention_count AS mentions,
    gr.rnk AS global_rank,
    gr.broker_count AS total_brokers
  FROM global_rankings gr
  JOIN target_brokers tb ON gr.broker = tb.broker
  WHERE gr.brokerage = target_brokerage
  ORDER BY gr.rnk, gr.mention_count DESC, gr.broker;
END;
$function$;