
-- Update get_competitive_rankings to support property_type and role filters
CREATE OR REPLACE FUNCTION public.get_competitive_rankings(
  target_brokerage text,
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL
)
RETURNS TABLE(brokerage text, is_target boolean, mentions bigint, rank bigint, vs_target_diff bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
      AND (property_type_filter IS NULL OR bms.property_type = property_type_filter)
      AND (role_filter IS NULL OR bms.broker_role = role_filter)
  ),
  ranked AS (
    SELECT bms.brokerage, SUM(bms.mentions)::bigint AS total_mentions,
      RANK() OVER (ORDER BY SUM(bms.mentions) DESC)::bigint AS rnk
    FROM brokerage_mentions_segmented bms
    WHERE (market_filter IS NULL OR bms.market = market_filter)
      AND (property_type_filter IS NULL OR bms.property_type = property_type_filter)
      AND (role_filter IS NULL OR bms.broker_role = role_filter)
    GROUP BY bms.brokerage
  )
  SELECT r.brokerage, (r.brokerage = target_brokerage) AS is_target,
    r.total_mentions AS mentions, r.rnk AS rank,
    (r.total_mentions - (SELECT target_count FROM target_mentions))::bigint AS vs_target_diff
  FROM ranked r ORDER BY r.rnk;
END;
$$;

-- Update get_dashboard_summary to support property_type and role filters
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
  target_brokerage text,
  target_market text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
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
  IF target_market IS NOT NULL AND LENGTH(target_market) > 200 THEN
    RAISE EXCEPTION 'target_market exceeds maximum length (200 chars)';
  END IF;

  SELECT COALESCE(SUM(bms.mentions), 0)::bigint
  INTO total_mentions
  FROM brokerage_mentions_segmented bms
  WHERE bms.brokerage = target_brokerage
    AND (target_market IS NULL OR bms.market = target_market)
    AND (property_type_filter IS NULL OR bms.property_type = property_type_filter)
    AND (role_filter IS NULL OR bms.broker_role = role_filter);

  SELECT COUNT(DISTINCT e.prompt_hash)::bigint
  INTO unique_prompts
  FROM lovable_entities e
  LEFT JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  WHERE (COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage)
    AND (target_market IS NULL OR p.primary_market = target_market OR p.submarket = target_market)
    AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    AND (role_filter IS NULL OR p.broker_role = role_filter);

  SELECT 
    COALESCE(bmt.primary_markets_present, 0)::bigint,
    COALESCE(bmt.submarkets_present, 0)::bigint
  INTO primary_markets_present, submarkets_present
  FROM brokerage_mentions_total bmt
  WHERE bmt.brokerage = target_brokerage;

  IF primary_markets_present IS NULL THEN primary_markets_present := 0; END IF;
  IF submarkets_present IS NULL THEN submarkets_present := 0; END IF;

  WITH ranked AS (
    SELECT bms.brokerage, RANK() OVER (ORDER BY SUM(bms.mentions) DESC)::bigint AS rnk
    FROM brokerage_mentions_segmented bms
    WHERE (target_market IS NULL OR bms.market = target_market)
      AND (property_type_filter IS NULL OR bms.property_type = property_type_filter)
      AND (role_filter IS NULL OR bms.broker_role = role_filter)
    GROUP BY bms.brokerage
  )
  SELECT COALESCE(r.rnk, 0) INTO overall_rank FROM ranked r WHERE r.brokerage = target_brokerage;

  WITH target_primary_markets AS (
    SELECT DISTINCT p.primary_market
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
      AND p.primary_market IS NOT NULL
  )
  SELECT COUNT(DISTINCT p.primary_market)::bigint
  INTO missed_markets_count
  FROM lovable_prompts p
  JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
  WHERE p.primary_market IS NOT NULL
    AND p.primary_market NOT IN (SELECT primary_market FROM target_primary_markets);

  SELECT bmr.market, bmr.mentions::bigint
  INTO top_market, top_market_mentions
  FROM brokerage_market_rankings bmr
  WHERE bmr.brokerage = target_brokerage
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

-- Update get_cre_dashboard_bootstrap to support property_type and role filters
CREATE OR REPLACE FUNCTION public.get_cre_dashboard_bootstrap(
  target_brokerage text DEFAULT NULL,
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF target_brokerage IS NOT NULL AND LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;
  IF market_filter IS NOT NULL AND LENGTH(market_filter) > 200 THEN
    RAISE EXCEPTION 'market_filter exceeds maximum length (200 chars)';
  END IF;

  SELECT jsonb_build_object(
    'markets', COALESCE((
      SELECT jsonb_agg(pm ORDER BY pm)
      FROM (SELECT DISTINCT primary_market AS pm FROM lovable_prompts WHERE primary_market IS NOT NULL) sub
    ), '[]'::jsonb),
    'submarkets', COALESCE((
      SELECT jsonb_agg(sm ORDER BY sm)
      FROM (SELECT DISTINCT submarket AS sm FROM lovable_prompts WHERE submarket IS NOT NULL) sub
    ), '[]'::jsonb),
    'propertyTypes', COALESCE((
      SELECT jsonb_agg(pt ORDER BY pt)
      FROM (SELECT DISTINCT property_type AS pt FROM lovable_prompts WHERE property_type IS NOT NULL) sub
    ), '[]'::jsonb),
    'roles', COALESCE((
      SELECT jsonb_agg(br ORDER BY br)
      FROM (SELECT DISTINCT broker_role AS br FROM lovable_prompts WHERE broker_role IS NOT NULL) sub
    ), '[]'::jsonb),
    'brokerages', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'brokerage', bmt.brokerage,
          'total_mentions', COALESCE(bmt.total_mentions, 0),
          'unique_prompts', COALESCE(bmt.unique_prompts, 0),
          'primary_markets_present', COALESCE(bmt.primary_markets_present, 0),
          'submarkets_present', COALESCE(bmt.submarkets_present, 0)
        ) ORDER BY bmt.total_mentions DESC NULLS LAST
      )
      FROM brokerage_mentions_total bmt
      WHERE bmt.brokerage IS NOT NULL
    ), '[]'::jsonb),
    'marketRankings', CASE WHEN target_brokerage IS NOT NULL THEN COALESCE((
      WITH brokerages_per_market AS (
        SELECT bmr2.market, COUNT(*)::int AS cnt
        FROM brokerage_market_rankings bmr2
        WHERE bmr2.market IS NOT NULL
        GROUP BY bmr2.market
      )
      SELECT jsonb_agg(
        jsonb_build_object(
          'market', bmr.market,
          'mentions', COALESCE(bmr.mentions, 0),
          'rank', COALESCE(bmr.market_rank, 1),
          'totalBrokerages', COALESCE(bpm.cnt, 0),
          'percentile', (1 - COALESCE(bmr.percentile, 0)) * 100,
          'marketSharePct', COALESCE(bmr.market_share_pct, 0)
        ) ORDER BY bmr.market_share_pct DESC NULLS LAST
      )
      FROM brokerage_market_rankings bmr
      LEFT JOIN brokerages_per_market bpm ON bpm.market = bmr.market
      WHERE bmr.brokerage = target_brokerage
    ), '[]'::jsonb) ELSE '[]'::jsonb END,
    'propertyTypeBreakdown', CASE WHEN target_brokerage IS NOT NULL THEN COALESCE((
      SELECT jsonb_agg(row_to_json(ptb.*) ORDER BY ptb.mentions DESC)
      FROM get_property_type_breakdown(target_brokerage, market_filter) ptb
    ), '[]'::jsonb) ELSE '[]'::jsonb END,
    'summary', CASE WHEN target_brokerage IS NOT NULL THEN
      get_dashboard_summary(target_brokerage, market_filter, property_type_filter, role_filter)
    ELSE '{}'::jsonb END,
    'primaryMarkets', CASE WHEN target_brokerage IS NOT NULL THEN COALESCE((
      SELECT jsonb_agg(pmb.primary_market ORDER BY pmb.primary_market)
      FROM get_primary_markets_for_brokerage(target_brokerage) pmb
    ), '[]'::jsonb) ELSE '[]'::jsonb END
  ) INTO result;

  RETURN result;
END;
$$;
