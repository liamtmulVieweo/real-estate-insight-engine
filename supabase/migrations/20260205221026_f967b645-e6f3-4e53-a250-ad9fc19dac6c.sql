-- Fix SECURITY DEFINER views by recreating them with explicit SECURITY INVOKER
-- Views will use caller's permissions (safe since underlying tables have public read policies)

DROP VIEW IF EXISTS public.brokerage_mentions_total;
DROP VIEW IF EXISTS public.brokerage_mentions_segmented;
DROP VIEW IF EXISTS public.brokerage_market_rankings;
DROP VIEW IF EXISTS public.domain_attribution_by_brokerage;

-- VIEW 1: Total AI Mentions per Brokerage (SECURITY INVOKER)
CREATE VIEW public.brokerage_mentions_total 
WITH (security_invoker = on) AS
SELECT 
  COALESCE(e.brokerage, e.name) AS brokerage,
  COUNT(*) AS total_mentions,
  COUNT(DISTINCT e.prompt_hash) AS unique_prompts,
  COUNT(DISTINCT p.market) AS markets_present
FROM public.lovable_entities e
JOIN public.lovable_prompts p ON e.prompt_hash = p.prompt_hash
GROUP BY COALESCE(e.brokerage, e.name);

-- VIEW 2: Mentions by Market, Property Type, Role (SECURITY INVOKER)
CREATE VIEW public.brokerage_mentions_segmented 
WITH (security_invoker = on) AS
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

-- VIEW 3: Brokerage Rank & Percentile by Market (SECURITY INVOKER)
CREATE VIEW public.brokerage_market_rankings 
WITH (security_invoker = on) AS
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

-- VIEW 4: Domain Attribution by Brokerage (SECURITY INVOKER)
CREATE VIEW public.domain_attribution_by_brokerage 
WITH (security_invoker = on) AS
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