
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  target_brokerage text,
  target_market text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL,
  state_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  SELECT COALESCE(SUM(bms.mentions), 0)::bigint
  INTO total_mentions
  FROM brokerage_mentions_segmented bms
  WHERE bms.brokerage = target_brokerage
    AND (target_market IS NULL OR bms.market = target_market)
    AND (property_type_filter IS NULL OR bms.property_type = property_type_filter)
    AND (role_filter IS NULL OR bms.broker_role = role_filter)
    AND (state_filter IS NULL OR bms.market LIKE '%, ' || state_filter);

  SELECT COUNT(DISTINCT e.prompt_hash)::bigint
  INTO unique_prompts
  FROM lovable_entities e
  LEFT JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  WHERE (COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage)
    AND (target_market IS NULL OR p.primary_market = target_market OR p.submarket = target_market)
    AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    AND (role_filter IS NULL OR p.broker_role = role_filter)
    AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter);

  -- Compute primary_markets_present and submarkets_present dynamically with state filter
  IF state_filter IS NULL THEN
    SELECT
      COALESCE(bmt.primary_markets_present, 0)::bigint,
      COALESCE(bmt.submarkets_present, 0)::bigint
    INTO primary_markets_present, submarkets_present
    FROM brokerage_mentions_total bmt
    WHERE bmt.brokerage = target_brokerage;
  ELSE
    -- Count distinct primary markets for this brokerage in the given state
    SELECT COUNT(DISTINCT p.primary_market)::bigint
    INTO primary_markets_present
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
      AND p.primary_market IS NOT NULL
      AND p.primary_market LIKE '%, ' || state_filter;

    -- Count distinct submarkets for this brokerage in the given state
    SELECT COUNT(DISTINCT p.submarket)::bigint
    INTO submarkets_present
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
      AND p.submarket IS NOT NULL
      AND p.primary_market LIKE '%, ' || state_filter;
  END IF;

  IF primary_markets_present IS NULL THEN primary_markets_present := 0; END IF;
  IF submarkets_present IS NULL THEN submarkets_present := 0; END IF;

  WITH ranked AS (
    SELECT bms.brokerage, RANK() OVER (ORDER BY SUM(bms.mentions) DESC)::bigint AS rnk
    FROM brokerage_mentions_segmented bms
    WHERE (target_market IS NULL OR bms.market = target_market)
      AND (property_type_filter IS NULL OR bms.property_type = property_type_filter)
      AND (role_filter IS NULL OR bms.broker_role = role_filter)
      AND (state_filter IS NULL OR bms.market LIKE '%, ' || state_filter)
    GROUP BY bms.brokerage
  )
  SELECT COALESCE(r.rnk, 0) INTO overall_rank FROM ranked r WHERE r.brokerage = target_brokerage;

  WITH target_primary_markets AS (
    SELECT DISTINCT p.primary_market
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
      AND p.primary_market IS NOT NULL
      AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
  )
  SELECT COUNT(DISTINCT p.primary_market)::bigint
  INTO missed_markets_count
  FROM lovable_prompts p
  JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
  WHERE p.primary_market IS NOT NULL
    AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
    AND p.primary_market NOT IN (SELECT primary_market FROM target_primary_markets);

  SELECT bmr.market, bmr.mentions::bigint
  INTO top_market, top_market_mentions
  FROM brokerage_market_rankings bmr
  WHERE bmr.brokerage = target_brokerage
    AND (state_filter IS NULL OR bmr.market LIKE '%, ' || state_filter)
  ORDER BY bmr.mentions DESC LIMIT 1;

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
$$;

NOTIFY pgrst, 'reload schema';
