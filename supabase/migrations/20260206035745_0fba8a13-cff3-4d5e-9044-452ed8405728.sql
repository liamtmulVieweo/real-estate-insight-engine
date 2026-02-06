-- Update get_dashboard_summary to return both market counts
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
    'primary_markets_present', COALESCE((
      SELECT MAX(primary_markets_present) 
      FROM brokerage_mentions_total 
      WHERE brokerage = target_brokerage
    ), 0),
    'submarkets_present', COALESCE((
      SELECT MAX(submarkets_present) 
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