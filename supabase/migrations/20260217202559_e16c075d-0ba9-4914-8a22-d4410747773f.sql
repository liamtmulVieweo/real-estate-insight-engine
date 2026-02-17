
CREATE OR REPLACE FUNCTION public.get_source_attribution_vs_competitor(
  target_brokerage text,
  competitor_brokerage text
)
RETURNS TABLE(domain text, target_pct double precision, competitor_pct double precision, category text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF competitor_brokerage IS NULL OR LENGTH(competitor_brokerage) = 0 THEN
    RAISE EXCEPTION 'competitor_brokerage is required';
  END IF;

  RETURN QUERY
  WITH target_domains AS (
    SELECT da.domain, da.pct_of_brokerage::double precision AS target_pct
    FROM domain_attribution_by_brokerage da WHERE da.brokerage = target_brokerage
  ),
  competitor_domains AS (
    SELECT da.domain, da.pct_of_brokerage::double precision AS competitor_pct
    FROM domain_attribution_by_brokerage da WHERE da.brokerage = competitor_brokerage
  ),
  domain_categories AS (
    SELECT DISTINCT ON (ld.domain) ld.domain, ld.category
    FROM lovable_domains ld
    WHERE ld.category IS NOT NULL
    ORDER BY ld.domain, ld.created_at DESC
  )
  SELECT
    COALESCE(td.domain, cd.domain) AS domain,
    ROUND(COALESCE(td.target_pct, 0)::numeric, 2)::double precision AS target_pct,
    ROUND(COALESCE(cd.competitor_pct, 0)::numeric, 2)::double precision AS competitor_pct,
    dc.category AS category
  FROM target_domains td
  FULL OUTER JOIN competitor_domains cd ON td.domain = cd.domain
  LEFT JOIN domain_categories dc ON dc.domain = COALESCE(td.domain, cd.domain)
  ORDER BY COALESCE(td.target_pct, 0) DESC
  LIMIT 50;
END;
$function$;
