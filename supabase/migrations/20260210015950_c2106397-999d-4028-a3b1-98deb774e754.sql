-- Recreate all 4 views to use COALESCE(e.normalized_brokerage, e.brokerage, e.name)

CREATE OR REPLACE VIEW public.brokerage_mentions_total AS
SELECT COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
    count(*) AS total_mentions,
    count(DISTINCT p.prompt_hash) AS unique_prompts,
    count(DISTINCT p.primary_market) AS primary_markets_present,
    count(DISTINCT p.submarket) AS submarkets_present
   FROM lovable_entities e
     JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name);

CREATE OR REPLACE VIEW public.brokerage_mentions_segmented AS
SELECT COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
    p.market,
    p.property_type,
    p.broker_role,
    p.model,
    count(*) AS mentions,
    sum(p.citation_count) AS total_citations
   FROM lovable_entities e
     JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name), p.market, p.property_type, p.broker_role, p.model;

CREATE OR REPLACE VIEW public.brokerage_market_rankings AS
SELECT COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
    p.primary_market AS market,
    count(*) AS mentions,
    rank() OVER (PARTITION BY p.primary_market ORDER BY (count(*)) DESC) AS market_rank,
    percent_rank() OVER (PARTITION BY p.primary_market ORDER BY (count(*)) DESC) AS percentile,
    count(*)::double precision / NULLIF(sum(count(*)) OVER (PARTITION BY p.primary_market), 0::numeric)::double precision * 100::double precision AS market_share_pct
   FROM lovable_entities e
     JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  WHERE p.primary_market IS NOT NULL
  GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name), p.primary_market;

CREATE OR REPLACE VIEW public.domain_attribution_by_brokerage AS
WITH brokerage_domains AS (
    SELECT COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
        d.domain,
        count(*) AS domain_mentions
       FROM lovable_entities e
         JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
         JOIN lovable_domains d ON p.prompt_hash = d.prompt_hash
      GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name), d.domain
)
SELECT brokerage,
    domain,
    domain_mentions,
    round(domain_mentions::numeric / NULLIF(sum(domain_mentions) OVER (PARTITION BY brokerage), 0::numeric) * 100::numeric, 2) AS pct_of_brokerage,
    rank() OVER (PARTITION BY brokerage ORDER BY domain_mentions DESC) AS domain_rank
   FROM brokerage_domains;

-- Update RPC functions to use the same COALESCE pattern

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
    AND (target_market IS NULL OR bms.market = target_market);

  SELECT COUNT(DISTINCT e.prompt_hash)::bigint
  INTO unique_prompts
  FROM lovable_entities e
  LEFT JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
  WHERE (COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage)
    AND (target_market IS NULL OR p.primary_market = target_market OR p.submarket = target_market);

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
    WHERE target_market IS NULL OR bms.market = target_market
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
$function$;

CREATE OR REPLACE FUNCTION public.get_missed_market_opportunities(target_brokerage text)
 RETURNS TABLE(market text, peer_count bigint, top_peers text[], total_peer_mentions bigint)
 LANGUAGE sql
 STABLE
AS $function$
  WITH target_markets AS (
    SELECT DISTINCT p.primary_market
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
      AND p.primary_market IS NOT NULL
  ),
  peer_market_mentions AS (
    SELECT 
      p.primary_market,
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
      COUNT(*) AS mentions
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE p.primary_market IS NOT NULL
      AND p.primary_market NOT IN (SELECT primary_market FROM target_markets)
      AND COALESCE(e.normalized_brokerage, e.brokerage, e.name) != target_brokerage
    GROUP BY p.primary_market, COALESCE(e.normalized_brokerage, e.brokerage, e.name)
  )
  SELECT 
    pmm.primary_market AS market,
    COUNT(DISTINCT pmm.brokerage) AS peer_count,
    (ARRAY_AGG(pmm.brokerage ORDER BY pmm.mentions DESC))[1:3] AS top_peers,
    SUM(pmm.mentions) AS total_peer_mentions
  FROM peer_market_mentions pmm
  GROUP BY pmm.primary_market
  ORDER BY total_peer_mentions DESC
  LIMIT 20;
$function$;

CREATE OR REPLACE FUNCTION public.get_primary_markets_for_brokerage(target_brokerage text)
 RETURNS TABLE(primary_market text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT DISTINCT p.primary_market
  FROM lovable_prompts p
  JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
  WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
    AND p.primary_market IS NOT NULL
  ORDER BY p.primary_market;
$function$;

CREATE OR REPLACE FUNCTION public.get_property_type_breakdown(target_brokerage text, market_filter text DEFAULT NULL::text)
 RETURNS TABLE(property_type text, mentions bigint, rank bigint, total_brokerages bigint)
 LANGUAGE sql
 STABLE
AS $function$
  WITH all_brokerage_property_counts AS (
    SELECT 
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
      p.property_type,
      COUNT(*)::bigint AS mentions
    FROM lovable_prompts p
    JOIN lovable_entities e ON e.prompt_hash = p.prompt_hash
    WHERE p.property_type IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
    GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name), p.property_type
  ),
  ranked_brokerages AS (
    SELECT 
      brokerage, property_type, mentions,
      RANK() OVER (PARTITION BY property_type ORDER BY mentions DESC)::bigint AS brokerage_rank,
      COUNT(*) OVER (PARTITION BY property_type)::bigint AS total_brokerages
    FROM all_brokerage_property_counts
  )
  SELECT rb.property_type, rb.mentions, rb.brokerage_rank AS rank, rb.total_brokerages
  FROM ranked_brokerages rb
  WHERE rb.brokerage = target_brokerage
  ORDER BY rb.mentions DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_broker_team_breakdown(target_brokerage text, market_filter text DEFAULT NULL::text, property_type_filter text DEFAULT NULL::text)
 RETURNS TABLE(broker_name text, property_types text[], mentions bigint, global_rank bigint, total_brokers bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;

  RETURN QUERY
  WITH all_broker_mentions AS (
    SELECT
      e.name AS broker,
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
      COUNT(*)::bigint AS mention_count
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      e.entity_type = 'broker'
      AND e.name IS NOT NULL
      AND p.property_type IS NOT NULL
      AND (market_filter IS NULL OR p.primary_market = market_filter)
      AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    GROUP BY e.name, COALESCE(e.normalized_brokerage, e.brokerage, e.name)
  ),
  global_rankings AS (
    SELECT abm.broker, abm.brokerage, abm.mention_count,
      RANK() OVER (ORDER BY abm.mention_count DESC)::bigint AS rnk,
      COUNT(*) OVER ()::bigint AS broker_count
    FROM all_broker_mentions abm
  ),
  target_brokers AS (
    SELECT
      e.name AS broker,
      ARRAY_AGG(DISTINCT p.property_type ORDER BY p.property_type) AS prop_types
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE 
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
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

-- Also update the prompt intelligence function
CREATE OR REPLACE FUNCTION public.get_prompt_intelligence(brokerage_filter text DEFAULT NULL::text, market_filter text DEFAULT NULL::text, property_type_filter text DEFAULT NULL::text, broker_role_filter text DEFAULT NULL::text, model_filter text DEFAULT NULL::text, broker_name_filter text DEFAULT NULL::text, page_limit integer DEFAULT 20, page_offset integer DEFAULT 0)
 RETURNS TABLE(prompt_hash text, prompt text, market text, property_type text, broker_role text, model text, citation_count integer, mentioned_entities jsonb, source_domains text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sanitized_broker_name text;
BEGIN
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
  IF page_limit IS NOT NULL AND (page_limit < 1 OR page_limit > 100) THEN
    RAISE EXCEPTION 'page_limit must be between 1 and 100';
  END IF;
  IF page_offset IS NOT NULL AND page_offset < 0 THEN
    RAISE EXCEPTION 'page_offset must be >= 0';
  END IF;

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
      AND (brokerage_filter IS NULL OR COALESCE(e.normalized_brokerage, e.brokerage) = brokerage_filter)
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
      (SELECT jsonb_agg(jsonb_build_object('name', e.name, 'brokerage', COALESCE(e.normalized_brokerage, e.brokerage), 'entity_type', e.entity_type))
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
$function$;

-- Update competitive rankings
CREATE OR REPLACE FUNCTION public.get_competitive_rankings(target_brokerage text, market_filter text DEFAULT NULL::text)
 RETURNS TABLE(brokerage text, is_target boolean, mentions bigint, rank bigint, vs_target_diff bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  ),
  ranked AS (
    SELECT bms.brokerage, SUM(bms.mentions)::bigint AS total_mentions,
      RANK() OVER (ORDER BY SUM(bms.mentions) DESC)::bigint AS rnk
    FROM brokerage_mentions_segmented bms
    WHERE market_filter IS NULL OR bms.market = market_filter
    GROUP BY bms.brokerage
  )
  SELECT r.brokerage, (r.brokerage = target_brokerage) AS is_target,
    r.total_mentions AS mentions, r.rnk AS rank,
    (r.total_mentions - (SELECT target_count FROM target_mentions))::bigint AS vs_target_diff
  FROM ranked r ORDER BY r.rnk;
END;
$function$;

-- Update source attribution
CREATE OR REPLACE FUNCTION public.get_source_attribution_comparison(target_brokerage text)
 RETURNS TABLE(domain text, target_rank bigint, target_pct double precision, peer_avg_rank double precision, peer_avg_pct double precision, diff_pct double precision)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH target_domains AS (
    SELECT da.domain, da.domain_rank::bigint AS target_rank, da.pct_of_brokerage::double precision AS target_pct
    FROM domain_attribution_by_brokerage da WHERE da.brokerage = target_brokerage
  ),
  peer_domains AS (
    SELECT da.domain, AVG(da.domain_rank)::double precision AS peer_avg_rank, AVG(da.pct_of_brokerage)::double precision AS peer_avg_pct
    FROM domain_attribution_by_brokerage da WHERE da.brokerage != target_brokerage GROUP BY da.domain
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
  ORDER BY COALESCE(td.target_pct, 0) DESC LIMIT 20;
END;
$function$;

-- Update underindex segments
CREATE OR REPLACE FUNCTION public.get_underindex_segments(target_brokerage text)
 RETURNS TABLE(property_type text, broker_role text, target_share_pct double precision, market_avg_share_pct double precision, gap_pct double precision, opportunity_score double precision)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH segment_totals AS (
    SELECT bms.property_type, bms.broker_role,
      SUM(bms.mentions)::double precision AS total_mentions,
      SUM(CASE WHEN bms.brokerage = target_brokerage THEN bms.mentions ELSE 0 END)::double precision AS target_mentions,
      COUNT(DISTINCT bms.brokerage)::double precision AS brokerage_count
    FROM brokerage_mentions_segmented bms
    WHERE bms.property_type IS NOT NULL AND bms.broker_role IS NOT NULL
    GROUP BY bms.property_type, bms.broker_role
    HAVING SUM(bms.mentions) > 0
  )
  SELECT st.property_type, st.broker_role,
    ROUND((st.target_mentions / NULLIF(st.total_mentions, 0) * 100)::numeric, 2)::double precision AS target_share_pct,
    ROUND((100.0 / NULLIF(st.brokerage_count, 0))::numeric, 2)::double precision AS market_avg_share_pct,
    ROUND(((100.0 / NULLIF(st.brokerage_count, 0)) - (st.target_mentions / NULLIF(st.total_mentions, 0) * 100))::numeric, 2)::double precision AS gap_pct,
    ROUND((st.total_mentions * ((100.0 / NULLIF(st.brokerage_count, 0)) - (st.target_mentions / NULLIF(st.total_mentions, 0) * 100)) / 100)::numeric, 2)::double precision AS opportunity_score
  FROM segment_totals st
  WHERE (st.target_mentions / NULLIF(st.total_mentions, 0) * 100) < (100.0 / NULLIF(st.brokerage_count, 0))
  ORDER BY opportunity_score DESC LIMIT 20;
END;
$function$;