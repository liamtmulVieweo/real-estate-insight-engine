CREATE OR REPLACE FUNCTION public.get_competitive_rankings(target_brokerage text, market_filter text DEFAULT NULL::text)
 RETURNS TABLE(brokerage text, is_target boolean, mentions bigint, rank bigint, vs_target_diff bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Input validation
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;
  IF market_filter IS NOT NULL AND LENGTH(market_filter) > 200 THEN
    RAISE EXCEPTION 'market_filter exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH target_mentions AS (
    SELECT COALESCE(SUM(bms.mentions), 0)::bigint AS target_count
    FROM brokerage_mentions_segmented bms
    WHERE bms.brokerage = target_brokerage
      AND (market_filter IS NULL OR bms.market = market_filter)
  ),
  ranked AS (
    SELECT
      bms.brokerage,
      SUM(bms.mentions)::bigint AS total_mentions,
      RANK() OVER (ORDER BY SUM(bms.mentions) DESC)::bigint AS rnk
    FROM brokerage_mentions_segmented bms
    WHERE market_filter IS NULL OR bms.market = market_filter
    GROUP BY bms.brokerage
  )
  SELECT
    r.brokerage,
    (r.brokerage = target_brokerage) AS is_target,
    r.total_mentions AS mentions,
    r.rnk AS rank,
    (r.total_mentions - (SELECT target_count FROM target_mentions))::bigint AS vs_target_diff
  FROM ranked r
  ORDER BY r.rnk;
END;
$function$;