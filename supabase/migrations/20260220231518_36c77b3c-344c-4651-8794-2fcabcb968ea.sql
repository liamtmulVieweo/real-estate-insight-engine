
-- Fix both bootstrap overloads: compute RANK in a CTE before aggregating

CREATE OR REPLACE FUNCTION public.get_cre_dashboard_bootstrap(
  target_brokerage text DEFAULT NULL,
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  ptb_json jsonb;
BEGIN
  IF target_brokerage IS NOT NULL AND LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;
  IF market_filter IS NOT NULL AND LENGTH(market_filter) > 200 THEN
    RAISE EXCEPTION 'market_filter exceeds maximum length (200 chars)';
  END IF;

  -- Build property type breakdown separately to avoid window-in-aggregate error
  IF target_brokerage IS NOT NULL THEN
    WITH ptb_counts AS (
      SELECT
        p.property_type,
        COUNT(*)::bigint AS mentions,
        (SELECT COUNT(DISTINCT COALESCE(e2.normalized_brokerage, e2.brokerage, e2.name))
         FROM lovable_entities e2
         JOIN lovable_prompts p2 ON e2.prompt_hash = p2.prompt_hash
         WHERE p2.property_type = p.property_type
           AND (market_filter IS NULL OR p2.primary_market = market_filter)
        )::bigint AS total_brokerages
      FROM lovable_prompts p
      JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
      WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
        AND p.property_type IS NOT NULL
        AND (market_filter IS NULL OR p.primary_market = market_filter)
      GROUP BY p.property_type
    ),
    ptb_ranked AS (
      SELECT
        property_type,
        mentions,
        total_brokerages,
        RANK() OVER (ORDER BY mentions DESC)::bigint AS rnk
      FROM ptb_counts
    )
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'property_type', pr.property_type,
        'mentions', pr.mentions,
        'rank', pr.rnk,
        'total_brokerages', pr.total_brokerages
      ) ORDER BY pr.mentions DESC
    ), '[]'::jsonb)
    INTO ptb_json
    FROM ptb_ranked pr;
  ELSE
    ptb_json := '[]'::jsonb;
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
    'propertyTypeBreakdown', ptb_json,
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

-- 5-param version with state_filter
CREATE OR REPLACE FUNCTION public.get_cre_dashboard_bootstrap(
  target_brokerage text DEFAULT NULL,
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  role_filter text DEFAULT NULL,
  state_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  ptb_json jsonb;
BEGIN
  IF target_brokerage IS NOT NULL AND LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;
  IF market_filter IS NOT NULL AND LENGTH(market_filter) > 200 THEN
    RAISE EXCEPTION 'market_filter exceeds maximum length (200 chars)';
  END IF;

  -- Build property type breakdown separately to avoid window-in-aggregate error
  IF target_brokerage IS NOT NULL THEN
    WITH ptb_counts AS (
      SELECT
        p.property_type,
        COUNT(*)::bigint AS mentions,
        (SELECT COUNT(DISTINCT COALESCE(e2.normalized_brokerage, e2.brokerage, e2.name))
         FROM lovable_entities e2
         JOIN lovable_prompts p2 ON e2.prompt_hash = p2.prompt_hash
         WHERE p2.property_type = p.property_type
           AND (market_filter IS NULL OR p2.primary_market = market_filter)
           AND (state_filter IS NULL OR p2.primary_market LIKE '%, ' || state_filter)
        )::bigint AS total_brokerages
      FROM lovable_prompts p
      JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
      WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
        AND p.property_type IS NOT NULL
        AND (market_filter IS NULL OR p.primary_market = market_filter)
        AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
      GROUP BY p.property_type
    ),
    ptb_ranked AS (
      SELECT
        property_type,
        mentions,
        total_brokerages,
        RANK() OVER (ORDER BY mentions DESC)::bigint AS rnk
      FROM ptb_counts
    )
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'property_type', pr.property_type,
        'mentions', pr.mentions,
        'rank', pr.rnk,
        'total_brokerages', pr.total_brokerages
      ) ORDER BY pr.mentions DESC
    ), '[]'::jsonb)
    INTO ptb_json
    FROM ptb_ranked pr;
  ELSE
    ptb_json := '[]'::jsonb;
  END IF;

  SELECT jsonb_build_object(
    'markets', COALESCE((
      SELECT jsonb_agg(pm ORDER BY pm)
      FROM (
        SELECT DISTINCT primary_market AS pm
        FROM lovable_prompts
        WHERE primary_market IS NOT NULL
          AND (state_filter IS NULL OR primary_market LIKE '%, ' || state_filter)
      ) sub
    ), '[]'::jsonb),
    'submarkets', COALESCE((
      SELECT jsonb_agg(sm ORDER BY sm)
      FROM (
        SELECT DISTINCT submarket AS sm
        FROM lovable_prompts
        WHERE submarket IS NOT NULL
          AND (state_filter IS NULL OR primary_market LIKE '%, ' || state_filter)
      ) sub
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
          AND (state_filter IS NULL OR bmr2.market LIKE '%, ' || state_filter)
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
        AND (state_filter IS NULL OR bmr.market LIKE '%, ' || state_filter)
    ), '[]'::jsonb) ELSE '[]'::jsonb END,
    'propertyTypeBreakdown', ptb_json,
    'summary', CASE WHEN target_brokerage IS NOT NULL THEN
      get_dashboard_summary(target_brokerage, market_filter, property_type_filter, role_filter, state_filter)
    ELSE '{}'::jsonb END,
    'primaryMarkets', CASE WHEN target_brokerage IS NOT NULL THEN COALESCE((
      SELECT jsonb_agg(pm ORDER BY pm)
      FROM (
        SELECT DISTINCT p.primary_market AS pm
        FROM lovable_prompts p
        JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
        WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
          AND p.primary_market IS NOT NULL
          AND (state_filter IS NULL OR p.primary_market LIKE '%, ' || state_filter)
      ) sub
    ), '[]'::jsonb) ELSE '[]'::jsonb END
  ) INTO result;

  RETURN result;
END;
$$;
