CREATE OR REPLACE FUNCTION public.get_dashboard_summary(target_brokerage text, target_market text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  total_mentions bigint;
  unique_prompts bigint;
  primary_markets_present bigint;
  submarkets_present bigint;
  overall_rank bigint;
  missed_markets_count bigint;
  top_market text;
  top_market_mentions bigint;
BEGIN
  -- Input validation
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;
  IF target_market IS NOT NULL AND LENGTH(target_market) > 200 THEN
    RAISE EXCEPTION 'target_market exceeds maximum length (200 chars)';
  END IF;

  -- Get total mentions
  SELECT COALESCE(SUM(bms.mentions), 0)::bigint
  INTO total_mentions
  FROM brokerage_mentions_segmented bms
  WHERE bms.brokerage = target_brokerage
    AND (target_market IS NULL OR bms.market = target_market);

  -- Get unique prompts
  SELECT COUNT(DISTINCT e.prompt_hash)::bigint
  INTO unique_prompts
  FROM lovable_entities e
  LEFT JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  WHERE (e.brokerage = target_brokerage OR e.name = target_brokerage)
    AND (target_market IS NULL OR p.primary_market = target_market OR p.submarket = target_market);

  -- Get primary markets and submarkets present from the view
  SELECT 
    COALESCE(bmt.primary_markets_present, 0)::bigint,
    COALESCE(bmt.submarkets_present, 0)::bigint
  INTO primary_markets_present, submarkets_present
  FROM brokerage_mentions_total bmt
  WHERE bmt.brokerage = target_brokerage;

  -- If no row found, set to 0
  IF primary_markets_present IS NULL THEN
    primary_markets_present := 0;
  END IF;
  IF submarkets_present IS NULL THEN
    submarkets_present := 0;
  END IF;

  -- Get overall rank (market_rank)
  WITH ranked AS (
    SELECT
      bms.brokerage,
      RANK() OVER (ORDER BY SUM(bms.mentions) DESC)::bigint AS rnk
    FROM brokerage_mentions_segmented bms
    WHERE target_market IS NULL OR bms.market = target_market
    GROUP BY bms.brokerage
  )
  SELECT COALESCE(r.rnk, 0)
  INTO overall_rank
  FROM ranked r
  WHERE r.brokerage = target_brokerage;

  -- Get missed markets count
  SELECT COUNT(*)::bigint
  INTO missed_markets_count
  FROM (
    SELECT DISTINCT bms.market
    FROM brokerage_mentions_segmented bms
    WHERE bms.market NOT IN (
      SELECT DISTINCT bms2.market 
      FROM brokerage_mentions_segmented bms2 
      WHERE bms2.brokerage = target_brokerage AND bms2.market IS NOT NULL
    )
    AND bms.market IS NOT NULL
  ) missed;

  -- Get top market
  SELECT bmr.market, bmr.mentions::bigint
  INTO top_market, top_market_mentions
  FROM brokerage_market_rankings bmr
  WHERE bmr.brokerage = target_brokerage
  ORDER BY bmr.mentions DESC
  LIMIT 1;

  result := jsonb_build_object(
    'total_mentions', COALESCE(total_mentions, 0),
    'unique_prompts', COALESCE(unique_prompts, 0),
    'primary_markets_present', COALESCE(primary_markets_present, 0),
    'submarkets_present', COALESCE(submarkets_present, 0),
    'market_rank', COALESCE(overall_rank, 0),
    'missed_markets_count', COALESCE(missed_markets_count, 0),
    'top_market', COALESCE(top_market, ''),
    'top_market_mentions', COALESCE(top_market_mentions, 0)
  );

  RETURN result;
END;
$function$;