-- =============================================
-- BASE TABLES
-- =============================================

-- Table 1: lovable_prompts (prompt-level facts)
CREATE TABLE public.lovable_prompts (
  prompt_hash TEXT PRIMARY KEY,
  geo_level TEXT,
  primary_market TEXT,
  submarket TEXT,
  market TEXT,
  property_type TEXT,
  broker_role TEXT,
  prompt TEXT,
  citation_count INT DEFAULT 0,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 2: lovable_entities (entities mentioned per prompt)
CREATE TABLE public.lovable_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT REFERENCES public.lovable_prompts(prompt_hash) ON DELETE CASCADE NOT NULL,
  market TEXT,
  entity_type TEXT CHECK (entity_type IN ('broker', 'brokerage')),
  name TEXT NOT NULL,
  brokerage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 3: lovable_domains (source attribution per prompt)
CREATE TABLE public.lovable_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash TEXT REFERENCES public.lovable_prompts(prompt_hash) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_entities_prompt_hash ON public.lovable_entities(prompt_hash);
CREATE INDEX idx_entities_brokerage ON public.lovable_entities(brokerage);
CREATE INDEX idx_entities_name ON public.lovable_entities(name);
CREATE INDEX idx_domains_prompt_hash ON public.lovable_domains(prompt_hash);
CREATE INDEX idx_prompts_market ON public.lovable_prompts(market);
CREATE INDEX idx_prompts_property_type ON public.lovable_prompts(property_type);

-- Enable RLS (public read for analytics)
ALTER TABLE public.lovable_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lovable_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lovable_domains ENABLE ROW LEVEL SECURITY;

-- Public read policies for dashboard access
CREATE POLICY "Public read access for prompts" ON public.lovable_prompts FOR SELECT USING (true);
CREATE POLICY "Public read access for entities" ON public.lovable_entities FOR SELECT USING (true);
CREATE POLICY "Public read access for domains" ON public.lovable_domains FOR SELECT USING (true);

-- =============================================
-- VIEW 1: Total AI Mentions per Brokerage
-- =============================================
CREATE OR REPLACE VIEW public.brokerage_mentions_total AS
SELECT 
  COALESCE(e.brokerage, e.name) AS brokerage,
  COUNT(*) AS total_mentions,
  COUNT(DISTINCT e.prompt_hash) AS unique_prompts,
  COUNT(DISTINCT p.market) AS markets_present
FROM public.lovable_entities e
JOIN public.lovable_prompts p ON e.prompt_hash = p.prompt_hash
GROUP BY COALESCE(e.brokerage, e.name);

-- =============================================
-- VIEW 2: Mentions by Market, Property Type, Role
-- =============================================
CREATE OR REPLACE VIEW public.brokerage_mentions_segmented AS
SELECT 
  COALESCE(e.brokerage, e.name) AS brokerage,
  p.market,
  p.property_type,
  p.broker_role,
  p.model,
  COUNT(*) AS mentions,
  SUM(p.citation_count) AS total_citations
FROM public.lovable_entities e
JOIN public.lovable_prompts p ON e.prompt_hash = p.prompt_hash
GROUP BY 
  COALESCE(e.brokerage, e.name),
  p.market,
  p.property_type,
  p.broker_role,
  p.model;

-- =============================================
-- VIEW 3: Brokerage Rank & Percentile by Market
-- =============================================
CREATE OR REPLACE VIEW public.brokerage_market_rankings AS
WITH market_counts AS (
  SELECT 
    COALESCE(e.brokerage, e.name) AS brokerage,
    p.market,
    COUNT(*) AS mentions
  FROM public.lovable_entities e
  JOIN public.lovable_prompts p ON e.prompt_hash = p.prompt_hash
  GROUP BY COALESCE(e.brokerage, e.name), p.market
)
SELECT 
  brokerage,
  market,
  mentions,
  RANK() OVER (PARTITION BY market ORDER BY mentions DESC) AS market_rank,
  PERCENT_RANK() OVER (PARTITION BY market ORDER BY mentions ASC) AS percentile,
  mentions::FLOAT / NULLIF(SUM(mentions) OVER (PARTITION BY market), 0) * 100 AS market_share_pct
FROM market_counts;

-- =============================================
-- VIEW 4: Domain Attribution by Brokerage
-- =============================================
CREATE OR REPLACE VIEW public.domain_attribution_by_brokerage AS
WITH brokerage_domains AS (
  SELECT 
    COALESCE(e.brokerage, e.name) AS brokerage,
    d.domain,
    COUNT(*) AS domain_mentions
  FROM public.lovable_entities e
  JOIN public.lovable_prompts p ON e.prompt_hash = p.prompt_hash
  JOIN public.lovable_domains d ON p.prompt_hash = d.prompt_hash
  GROUP BY COALESCE(e.brokerage, e.name), d.domain
)
SELECT 
  brokerage,
  domain,
  domain_mentions,
  ROUND(domain_mentions::NUMERIC / NULLIF(SUM(domain_mentions) OVER (PARTITION BY brokerage), 0) * 100, 2) AS pct_of_brokerage,
  RANK() OVER (PARTITION BY brokerage ORDER BY domain_mentions DESC) AS domain_rank
FROM brokerage_domains;

-- =============================================
-- FUNCTION 1: Competitive Rankings
-- =============================================
CREATE OR REPLACE FUNCTION public.get_competitive_rankings(
  target_brokerage TEXT,
  market_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  brokerage TEXT,
  mentions BIGINT,
  rank BIGINT,
  vs_target_diff BIGINT,
  is_target BOOLEAN
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT 
      COALESCE(e.brokerage, e.name) AS b,
      COUNT(*) AS m
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE (market_filter IS NULL OR p.market = market_filter)
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
$$;

-- =============================================
-- FUNCTION 2: Missed Market Opportunities
-- =============================================
CREATE OR REPLACE FUNCTION public.get_missed_market_opportunities(target_brokerage TEXT)
RETURNS TABLE (
  market TEXT,
  peer_count BIGINT,
  top_peers TEXT[],
  total_peer_mentions BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH target_markets AS (
    SELECT DISTINCT p.market AS m
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.brokerage, e.name) = target_brokerage
  ),
  all_markets AS (
    SELECT 
      p.market AS m,
      COALESCE(e.brokerage, e.name) AS b,
      COUNT(*) AS mentions
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    WHERE COALESCE(e.brokerage, e.name) != target_brokerage
    GROUP BY p.market, COALESCE(e.brokerage, e.name)
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
$$;

-- =============================================
-- FUNCTION 3: Under-indexed Segments
-- =============================================
CREATE OR REPLACE FUNCTION public.get_underindex_segments(target_brokerage TEXT)
RETURNS TABLE (
  property_type TEXT,
  broker_role TEXT,
  target_share_pct NUMERIC,
  market_avg_share_pct NUMERIC,
  gap_pct NUMERIC,
  opportunity_score NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH segment_totals AS (
    SELECT 
      p.property_type AS pt,
      p.broker_role AS br,
      COALESCE(e.brokerage, e.name) AS b,
      COUNT(*) AS mentions
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    GROUP BY p.property_type, p.broker_role, COALESCE(e.brokerage, e.name)
  ),
  segment_stats AS (
    SELECT 
      pt,
      br,
      SUM(mentions) AS total_mentions,
      AVG(mentions) AS avg_mentions,
      MAX(CASE WHEN b = target_brokerage THEN mentions ELSE 0 END) AS target_mentions
    FROM segment_totals
    GROUP BY pt, br
  )
  SELECT 
    ss.pt AS property_type,
    ss.br AS broker_role,
    ROUND(ss.target_mentions::NUMERIC / NULLIF(ss.total_mentions, 0) * 100, 2) AS target_share_pct,
    ROUND(ss.avg_mentions / NULLIF(ss.total_mentions, 0) * 100, 2) AS market_avg_share_pct,
    ROUND((ss.avg_mentions - ss.target_mentions)::NUMERIC / NULLIF(ss.total_mentions, 0) * 100, 2) AS gap_pct,
    ROUND((ss.avg_mentions - ss.target_mentions) * LN(ss.total_mentions + 1), 2) AS opportunity_score
  FROM segment_stats ss
  WHERE ss.target_mentions < ss.avg_mentions
  ORDER BY (ss.avg_mentions - ss.target_mentions) * LN(ss.total_mentions + 1) DESC;
END;
$$;

-- =============================================
-- FUNCTION 4: Prompt Intelligence (Filterable)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_prompt_intelligence(
  brokerage_filter TEXT DEFAULT NULL,
  broker_name_filter TEXT DEFAULT NULL,
  market_filter TEXT DEFAULT NULL,
  property_type_filter TEXT DEFAULT NULL,
  broker_role_filter TEXT DEFAULT NULL,
  model_filter TEXT DEFAULT NULL,
  page_limit INT DEFAULT 50,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  prompt_hash TEXT,
  prompt TEXT,
  market TEXT,
  property_type TEXT,
  broker_role TEXT,
  model TEXT,
  citation_count INT,
  mentioned_entities JSONB,
  source_domains TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.prompt_hash,
    p.prompt,
    p.market,
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
    AND (market_filter IS NULL OR p.market = market_filter)
    AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
    AND (broker_role_filter IS NULL OR p.broker_role = broker_role_filter)
    AND (model_filter IS NULL OR p.model = model_filter)
  GROUP BY p.prompt_hash, p.prompt, p.market, p.property_type, p.broker_role, p.model, p.citation_count
  ORDER BY p.citation_count DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

-- =============================================
-- FUNCTION 5: Source Attribution Comparison
-- =============================================
CREATE OR REPLACE FUNCTION public.get_source_attribution_comparison(target_brokerage TEXT)
RETURNS TABLE (
  domain TEXT,
  target_pct NUMERIC,
  peer_avg_pct NUMERIC,
  diff_pct NUMERIC,
  target_rank INT,
  peer_avg_rank NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH all_domain_stats AS (
    SELECT 
      COALESCE(e.brokerage, e.name) AS b,
      d.domain AS dom,
      COUNT(*) AS mentions,
      COUNT(*)::NUMERIC / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY COALESCE(e.brokerage, e.name)), 0) * 100 AS pct
    FROM lovable_entities e
    JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
    JOIN lovable_domains d ON p.prompt_hash = d.prompt_hash
    GROUP BY COALESCE(e.brokerage, e.name), d.domain
  ),
  ranked AS (
    SELECT 
      b,
      dom,
      mentions,
      pct,
      RANK() OVER (PARTITION BY b ORDER BY mentions DESC)::INT AS domain_rank
    FROM all_domain_stats
  )
  SELECT 
    ranked.dom AS domain,
    ROUND(MAX(CASE WHEN ranked.b = target_brokerage THEN ranked.pct END), 2) AS target_pct,
    ROUND(AVG(CASE WHEN ranked.b != target_brokerage THEN ranked.pct END), 2) AS peer_avg_pct,
    ROUND(MAX(CASE WHEN ranked.b = target_brokerage THEN ranked.pct END) - 
          AVG(CASE WHEN ranked.b != target_brokerage THEN ranked.pct END), 2) AS diff_pct,
    MAX(CASE WHEN ranked.b = target_brokerage THEN ranked.domain_rank END)::INT AS target_rank,
    ROUND(AVG(CASE WHEN ranked.b != target_brokerage THEN ranked.domain_rank END), 1) AS peer_avg_rank
  FROM ranked
  GROUP BY ranked.dom
  HAVING MAX(CASE WHEN ranked.b = target_brokerage THEN 1 END) = 1
  ORDER BY MAX(CASE WHEN ranked.b = target_brokerage THEN ranked.pct END) DESC NULLS LAST;
END;
$$;

-- =============================================
-- FUNCTION 6: Dashboard Summary
-- =============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(target_brokerage TEXT, target_market TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;