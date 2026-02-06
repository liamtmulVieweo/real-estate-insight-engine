-- Update brokerage_market_rankings view to use primary_market
DROP VIEW IF EXISTS brokerage_market_rankings;
CREATE VIEW brokerage_market_rankings AS
SELECT 
  COALESCE(e.brokerage, e.name) AS brokerage,
  p.primary_market AS market,
  COUNT(*) AS mentions,
  RANK() OVER (PARTITION BY p.primary_market ORDER BY COUNT(*) DESC) AS market_rank,
  PERCENT_RANK() OVER (PARTITION BY p.primary_market ORDER BY COUNT(*) DESC) AS percentile,
  COUNT(*)::FLOAT / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY p.primary_market), 0) * 100 AS market_share_pct
FROM lovable_entities e
JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
WHERE p.primary_market IS NOT NULL
GROUP BY COALESCE(e.brokerage, e.name), p.primary_market;

-- Update get_competitive_rankings to use primary_market
CREATE OR REPLACE FUNCTION public.get_competitive_rankings(target_brokerage text, market_filter text DEFAULT NULL::text)
 RETURNS TABLE(brokerage text, mentions bigint, rank bigint, vs_target_diff bigint, is_target boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT 
      COALESCE(e.brokerage, e.name) AS b,
      COUNT(*) AS m
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE (market_filter IS NULL OR p.primary_market = market_filter)
    GROUP BY COALESCE(e.brokerage, e.name)
  ),
  ranked AS (
    SELECT 
      base.b,
      base.m,
      RANK() OVER (ORDER BY base.m DESC) AS r
    FROM base
  ),
  target_m AS (
    SELECT m FROM ranked WHERE b = target_brokerage
  )
  SELECT 
    ranked.b AS brokerage,
    ranked.m AS mentions,
    ranked.r AS rank,
    ranked.m - COALESCE((SELECT m FROM target_m), 0) AS vs_target_diff,
    ranked.b = target_brokerage AS is_target
  FROM ranked
  ORDER BY ranked.r;
END;
$function$;

-- Update get_missed_market_opportunities to use primary_market
CREATE OR REPLACE FUNCTION public.get_missed_market_opportunities(target_brokerage text)
 RETURNS TABLE(market text, peer_count bigint, top_peers text[], total_peer_mentions bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH target_markets AS (
    SELECT DISTINCT p.primary_market AS m
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.brokerage, e.name) = target_brokerage
  ),
  all_markets AS (
    SELECT 
      p.primary_market AS m,
      COALESCE(e.brokerage, e.name) AS b,
      COUNT(*) AS mentions
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.brokerage, e.name) != target_brokerage
    GROUP BY p.primary_market, COALESCE(e.brokerage, e.name)
  )
  SELECT 
    am.m AS market,
    COUNT(DISTINCT am.b)::BIGINT AS peer_count,
    (SELECT ARRAY_AGG(sub.b ORDER BY sub.mentions DESC) 
     FROM (SELECT DISTINCT ON (am2.b) am2.b, am2.mentions 
           FROM all_markets am2 
           WHERE am2.m = am.m 
           ORDER BY am2.b, am2.mentions DESC 
           LIMIT 5) sub)::TEXT[] AS top_peers,
    SUM(am.mentions)::BIGINT AS total_peer_mentions
  FROM all_markets am
  WHERE am.m IS NOT NULL AND am.m NOT IN (SELECT tm.m FROM target_markets tm WHERE tm.m IS NOT NULL)
  GROUP BY am.m
  ORDER BY SUM(am.mentions) DESC;
END;
$function$;

-- Update get_dashboard_summary to use primary_market
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(target_brokerage text, target_market text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'total_mentions', COALESCE((
      SELECT SUM(total_mentions) 
      FROM brokerage_mentions_total 
      WHERE brokerage = target_brokerage
    ), 0),
    'unique_prompts', COALESCE((
      SELECT SUM(unique_prompts) 
      FROM brokerage_mentions_total 
      WHERE brokerage = target_brokerage
    ), 0),
    'markets_present', COALESCE((
      SELECT MAX(markets_present) 
      FROM brokerage_mentions_total 
      WHERE brokerage = target_brokerage
    ), 0),
    'market_rank', (
      SELECT market_rank 
      FROM brokerage_market_rankings 
      WHERE brokerage = target_brokerage AND (target_market IS NULL OR market = target_market)
      LIMIT 1
    ),
    'percentile', (
      SELECT ROUND(percentile * 100) 
      FROM brokerage_market_rankings 
      WHERE brokerage = target_brokerage AND (target_market IS NULL OR market = target_market)
      LIMIT 1
    ),
    'missed_markets_count', (
      SELECT COUNT(*) FROM get_missed_market_opportunities(target_brokerage)
    )
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Update get_prompt_intelligence to use primary_market
CREATE OR REPLACE FUNCTION public.get_prompt_intelligence(brokerage_filter text DEFAULT NULL::text, broker_name_filter text DEFAULT NULL::text, market_filter text DEFAULT NULL::text, property_type_filter text DEFAULT NULL::text, broker_role_filter text DEFAULT NULL::text, model_filter text DEFAULT NULL::text, page_limit integer DEFAULT 50, page_offset integer DEFAULT 0)
 RETURNS TABLE(prompt_hash text, prompt text, market text, property_type text, broker_role text, model text, citation_count integer, mentioned_entities jsonb, source_domains text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.prompt_hash,
    p.prompt,
    p.primary_market AS market,
    p.property_type,
    p.broker_role,
    p.model,
    p.citation_count,
    JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
      'name', e.name,
      'type', e.entity_type,
      'brokerage', e.brokerage
    )) AS mentioned_entities,
    ARRAY_AGG(DISTINCT d.domain) FILTER (WHERE d.domain IS NOT NULL) AS source_domains
  FROM lovable_prompts p
  JOIN lovable_entities e ON p.prompt_hash = e.prompt_hash
  LEFT JOIN lovable_domains d ON p.prompt_hash = d.prompt_hash
  WHERE 
    (brokerage_filter IS NULL OR e.brokerage = brokerage_filter)
    AND (broker_name_filter IS NULL OR e.name ILIKE '%' || broker_name_filter || '%')
    AND (market_filter IS NULL OR p.primary_market = market_filter)
    AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    AND (broker_role_filter IS NULL OR p.broker_role = broker_role_filter)
    AND (model_filter IS NULL OR p.model = model_filter)
  GROUP BY p.prompt_hash, p.prompt, p.primary_market, p.property_type, p.broker_role, p.model, p.citation_count
  ORDER BY p.citation_count DESC
  LIMIT page_limit OFFSET page_offset;
END;
$function$;