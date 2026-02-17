
DROP FUNCTION IF EXISTS public.get_source_attribution_comparison(text);

CREATE OR REPLACE FUNCTION public.get_source_attribution_comparison(target_brokerage text)
RETURNS TABLE(
  domain text,
  target_rank bigint,
  target_pct double precision,
  peer_avg_rank double precision,
  peer_avg_pct double precision,
  diff_pct double precision,
  category text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
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
  ),
  domain_categories AS (
    SELECT DISTINCT ON (ld.domain) ld.domain, ld.category
    FROM lovable_domains ld
    WHERE ld.category IS NOT NULL
    ORDER BY ld.domain, ld.created_at DESC
  )
  SELECT
    COALESCE(td.domain, pd.domain) AS domain,
    COALESCE(td.target_rank, 0) AS target_rank,
    ROUND(COALESCE(td.target_pct, 0)::numeric, 2)::double precision AS target_pct,
    ROUND(COALESCE(pd.peer_avg_rank, 0)::numeric, 2)::double precision AS peer_avg_rank,
    ROUND(COALESCE(pd.peer_avg_pct, 0)::numeric, 2)::double precision AS peer_avg_pct,
    ROUND((COALESCE(td.target_pct, 0) - COALESCE(pd.peer_avg_pct, 0))::numeric, 2)::double precision AS diff_pct,
    dc.category AS category
  FROM target_domains td
  FULL OUTER JOIN peer_domains pd ON td.domain = pd.domain
  LEFT JOIN domain_categories dc ON dc.domain = COALESCE(td.domain, pd.domain)
  ORDER BY COALESCE(td.target_pct, 0) DESC
  LIMIT 50;
END;
$$;
