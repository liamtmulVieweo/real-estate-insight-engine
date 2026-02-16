
-- =============================================================
-- get_cre_dashboard_bootstrap: single RPC for all Tier 1 data
-- Returns filters, brokerage list, and market rankings for target
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_cre_dashboard_bootstrap(
  target_brokerage text DEFAULT NULL,
  market_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    -- Filter options (DISTINCT from lovable_prompts)
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
    -- Brokerage list from pre-aggregated view
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
    -- Market rankings for target brokerage
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
    -- Property type breakdown for target brokerage
    'propertyTypeBreakdown', CASE WHEN target_brokerage IS NOT NULL THEN COALESCE((
      SELECT jsonb_agg(row_to_json(ptb.*) ORDER BY ptb.mentions DESC)
      FROM get_property_type_breakdown(target_brokerage, market_filter) ptb
    ), '[]'::jsonb) ELSE '[]'::jsonb END,
    -- Dashboard summary for target brokerage
    'summary', CASE WHEN target_brokerage IS NOT NULL THEN
      get_dashboard_summary(target_brokerage, market_filter)
    ELSE '{}'::jsonb END,
    -- Primary markets for target brokerage
    'primaryMarkets', CASE WHEN target_brokerage IS NOT NULL THEN COALESCE((
      SELECT jsonb_agg(pmb.primary_market ORDER BY pmb.primary_market)
      FROM get_primary_markets_for_brokerage(target_brokerage) pmb
    ), '[]'::jsonb) ELSE '[]'::jsonb END
  ) INTO result;

  RETURN result;
END;
$function$;
