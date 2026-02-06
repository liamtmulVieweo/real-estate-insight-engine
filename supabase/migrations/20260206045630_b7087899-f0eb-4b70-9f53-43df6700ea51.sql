-- Drop existing functions first to allow return type changes
DROP FUNCTION IF EXISTS public.get_competitive_rankings(text, text);
DROP FUNCTION IF EXISTS public.get_missed_market_opportunities(text);
DROP FUNCTION IF EXISTS public.get_underindex_segments(text);
DROP FUNCTION IF EXISTS public.get_prompt_intelligence(text, text, text, text, text, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_source_attribution_comparison(text);
DROP FUNCTION IF EXISTS public.get_dashboard_summary(text, text);

-- 1. Recreate get_competitive_rankings with input validation
CREATE FUNCTION public.get_competitive_rankings(target_brokerage text, market_filter text DEFAULT NULL)
RETURNS TABLE(brokerage text, is_target boolean, mentions bigint, rank bigint, vs_target_diff bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  ORDER BY r.rnk
  LIMIT 20;
END;
$$;

-- 2. Recreate get_missed_market_opportunities with input validation
CREATE FUNCTION public.get_missed_market_opportunities(target_brokerage text)
RETURNS TABLE(market text, peer_count bigint, top_peers text[], total_peer_mentions bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH target_markets AS (
    SELECT DISTINCT bms.market
    FROM brokerage_mentions_segmented bms
    WHERE bms.brokerage = target_brokerage
  ),
  peer_markets AS (
    SELECT
      bms.market,
      COUNT(DISTINCT bms.brokerage)::bigint AS peer_count,
      ARRAY_AGG(DISTINCT bms.brokerage ORDER BY bms.brokerage)::text[] AS top_peers,
      SUM(bms.mentions)::bigint AS total_peer_mentions
    FROM brokerage_mentions_segmented bms
    WHERE bms.market NOT IN (SELECT tm.market FROM target_markets tm WHERE tm.market IS NOT NULL)
      AND bms.brokerage != target_brokerage
      AND bms.market IS NOT NULL
    GROUP BY bms.market
  )
  SELECT pm.market, pm.peer_count, pm.top_peers[1:5], pm.total_peer_mentions
  FROM peer_markets pm
  ORDER BY pm.total_peer_mentions DESC
  LIMIT 10;
END;
$$;

-- 3. Recreate get_underindex_segments with input validation
CREATE FUNCTION public.get_underindex_segments(target_brokerage text)
RETURNS TABLE(property_type text, broker_role text, target_share_pct double precision, market_avg_share_pct double precision, gap_pct double precision, opportunity_score double precision)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH segment_totals AS (
    SELECT
      bms.property_type,
      bms.broker_role,
      SUM(bms.mentions)::double precision AS total_mentions,
      SUM(CASE WHEN bms.brokerage = target_brokerage THEN bms.mentions ELSE 0 END)::double precision AS target_mentions,
      COUNT(DISTINCT bms.brokerage)::double precision AS brokerage_count
    FROM brokerage_mentions_segmented bms
    WHERE bms.property_type IS NOT NULL AND bms.broker_role IS NOT NULL
    GROUP BY bms.property_type, bms.broker_role
    HAVING SUM(bms.mentions) > 0
  )
  SELECT
    st.property_type,
    st.broker_role,
    ROUND((st.target_mentions / NULLIF(st.total_mentions, 0) * 100)::numeric, 2)::double precision AS target_share_pct,
    ROUND((100.0 / NULLIF(st.brokerage_count, 0))::numeric, 2)::double precision AS market_avg_share_pct,
    ROUND(((100.0 / NULLIF(st.brokerage_count, 0)) - (st.target_mentions / NULLIF(st.total_mentions, 0) * 100))::numeric, 2)::double precision AS gap_pct,
    ROUND((st.total_mentions * ((100.0 / NULLIF(st.brokerage_count, 0)) - (st.target_mentions / NULLIF(st.total_mentions, 0) * 100)) / 100)::numeric, 2)::double precision AS opportunity_score
  FROM segment_totals st
  WHERE (st.target_mentions / NULLIF(st.total_mentions, 0) * 100) < (100.0 / NULLIF(st.brokerage_count, 0))
  ORDER BY opportunity_score DESC
  LIMIT 20;
END;
$$;

-- 4. Recreate get_prompt_intelligence with input validation and ILIKE sanitization
CREATE FUNCTION public.get_prompt_intelligence(
  brokerage_filter text DEFAULT NULL,
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  broker_role_filter text DEFAULT NULL,
  model_filter text DEFAULT NULL,
  broker_name_filter text DEFAULT NULL,
  page_limit integer DEFAULT 20,
  page_offset integer DEFAULT 0
)
RETURNS TABLE(
  prompt_hash text,
  prompt text,
  market text,
  property_type text,
  broker_role text,
  model text,
  citation_count integer,
  mentioned_entities jsonb,
  source_domains text[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sanitized_broker_name text;
BEGIN
  -- Input validation - length limits
  IF brokerage_filter IS NOT NULL AND LENGTH(brokerage_filter) > 200 THEN
    RAISE EXCEPTION 'brokerage_filter exceeds maximum length (200 chars)';
  END IF;
  IF market_filter IS NOT NULL AND LENGTH(market_filter) > 200 THEN
    RAISE EXCEPTION 'market_filter exceeds maximum length (200 chars)';
  END IF;
  IF property_type_filter IS NOT NULL AND LENGTH(property_type_filter) > 100 THEN
    RAISE EXCEPTION 'property_type_filter exceeds maximum length (100 chars)';
  END IF;
  IF broker_role_filter IS NOT NULL AND LENGTH(broker_role_filter) > 100 THEN
    RAISE EXCEPTION 'broker_role_filter exceeds maximum length (100 chars)';
  END IF;
  IF model_filter IS NOT NULL AND LENGTH(model_filter) > 100 THEN
    RAISE EXCEPTION 'model_filter exceeds maximum length (100 chars)';
  END IF;
  IF broker_name_filter IS NOT NULL AND LENGTH(broker_name_filter) > 200 THEN
    RAISE EXCEPTION 'broker_name_filter exceeds maximum length (200 chars)';
  END IF;
  
  -- Pagination validation
  IF page_limit IS NOT NULL AND (page_limit < 1 OR page_limit > 100) THEN
    RAISE EXCEPTION 'page_limit must be between 1 and 100';
  END IF;
  IF page_offset IS NOT NULL AND page_offset < 0 THEN
    RAISE EXCEPTION 'page_offset must be >= 0';
  END IF;

  -- Sanitize ILIKE pattern for broker_name_filter
  IF broker_name_filter IS NOT NULL THEN
    sanitized_broker_name := REPLACE(REPLACE(broker_name_filter, '%', '\%'), '_', '\_');
  END IF;

  RETURN QUERY
  WITH filtered_prompts AS (
    SELECT DISTINCT p.prompt_hash
    FROM lovable_prompts p
    LEFT JOIN lovable_entities e ON p.prompt_hash = e.prompt_hash
    WHERE (market_filter IS NULL OR p.primary_market = market_filter OR p.submarket = market_filter)
      AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR p.broker_role = broker_role_filter)
      AND (model_filter IS NULL OR p.model = model_filter)
      AND (brokerage_filter IS NULL OR e.brokerage = brokerage_filter)
      AND (sanitized_broker_name IS NULL OR e.name ILIKE '%' || sanitized_broker_name || '%')
  )
  SELECT
    p.prompt_hash,
    p.prompt,
    COALESCE(p.primary_market, p.submarket, p.market) AS market,
    p.property_type,
    p.broker_role,
    p.model,
    p.citation_count,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('name', e.name, 'brokerage', e.brokerage, 'entity_type', e.entity_type))
       FROM lovable_entities e WHERE e.prompt_hash = p.prompt_hash),
      '[]'::jsonb
    ) AS mentioned_entities,
    COALESCE(
      (SELECT array_agg(DISTINCT d.domain) FROM lovable_domains d WHERE d.prompt_hash = p.prompt_hash),
      '{}'::text[]
    ) AS source_domains
  FROM lovable_prompts p
  WHERE p.prompt_hash IN (SELECT fp.prompt_hash FROM filtered_prompts fp)
  ORDER BY p.citation_count DESC NULLS LAST
  LIMIT COALESCE(page_limit, 20)
  OFFSET COALESCE(page_offset, 0);
END;
$$;

-- 5. Recreate get_source_attribution_comparison with input validation
CREATE FUNCTION public.get_source_attribution_comparison(target_brokerage text)
RETURNS TABLE(domain text, target_rank bigint, target_pct double precision, peer_avg_rank double precision, peer_avg_pct double precision, diff_pct double precision)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH target_domains AS (
    SELECT
      da.domain,
      da.domain_rank::bigint AS target_rank,
      da.pct_of_brokerage::double precision AS target_pct
    FROM domain_attribution_by_brokerage da
    WHERE da.brokerage = target_brokerage
  ),
  peer_domains AS (
    SELECT
      da.domain,
      AVG(da.domain_rank)::double precision AS peer_avg_rank,
      AVG(da.pct_of_brokerage)::double precision AS peer_avg_pct
    FROM domain_attribution_by_brokerage da
    WHERE da.brokerage != target_brokerage
    GROUP BY da.domain
  )
  SELECT
    COALESCE(td.domain, pd.domain) AS domain,
    COALESCE(td.target_rank, 0) AS target_rank,
    ROUND(COALESCE(td.target_pct, 0)::numeric, 2)::double precision AS target_pct,
    ROUND(COALESCE(pd.peer_avg_rank, 0)::numeric, 2)::double precision AS peer_avg_rank,
    ROUND(COALESCE(pd.peer_avg_pct, 0)::numeric, 2)::double precision AS peer_avg_pct,
    ROUND((COALESCE(td.target_pct, 0) - COALESCE(pd.peer_avg_pct, 0))::numeric, 2)::double precision AS diff_pct
  FROM target_domains td
  FULL OUTER JOIN peer_domains pd ON td.domain = pd.domain
  ORDER BY COALESCE(td.target_pct, 0) DESC
  LIMIT 20;
END;
$$;

-- 6. Recreate get_dashboard_summary with input validation
CREATE FUNCTION public.get_dashboard_summary(target_brokerage text, target_market text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_mentions bigint;
  unique_prompts bigint;
  markets_present bigint;
  overall_rank bigint;
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

  -- Get markets present
  SELECT COUNT(DISTINCT bms.market)::bigint
  INTO markets_present
  FROM brokerage_mentions_segmented bms
  WHERE bms.brokerage = target_brokerage;

  -- Get overall rank
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
    'markets_present', COALESCE(markets_present, 0),
    'overall_rank', COALESCE(overall_rank, 0),
    'top_market', COALESCE(top_market, ''),
    'top_market_mentions', COALESCE(top_market_mentions, 0)
  );

  RETURN result;
END;
$$;