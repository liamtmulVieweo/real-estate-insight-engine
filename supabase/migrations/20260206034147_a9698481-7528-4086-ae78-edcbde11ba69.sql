-- Fix get_prompt_intelligence to use COALESCE for brokerage matching
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
    (brokerage_filter IS NULL OR COALESCE(e.brokerage, e.name) = brokerage_filter)
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