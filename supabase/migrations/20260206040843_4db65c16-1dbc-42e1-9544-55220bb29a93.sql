
CREATE OR REPLACE FUNCTION public.get_underindex_segments(target_brokerage text)
 RETURNS TABLE(property_type text, broker_role text, target_share_pct numeric, market_avg_share_pct numeric, gap_pct numeric, opportunity_score numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE ss.target_mentions = 0  -- Only show completely missing specialties
  ORDER BY (ss.avg_mentions - ss.target_mentions) * LN(ss.total_mentions + 1) DESC;
END;
$function$;
