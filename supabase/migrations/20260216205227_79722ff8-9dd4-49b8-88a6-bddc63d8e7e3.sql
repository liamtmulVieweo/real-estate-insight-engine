
-- =============================================================
-- get_vieweo_bootstrap: returns stats, filters, top brokerages
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_vieweo_bootstrap(
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  broker_role_filter text DEFAULT NULL,
  entity_type_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  stats_obj jsonb;
  filters_obj jsonb;
  top_brokerages_arr jsonb;
  total_rec bigint;
  total_filtered bigint;
BEGIN
  -- Input validation
  IF market_filter IS NOT NULL AND LENGTH(market_filter) > 200 THEN
    RAISE EXCEPTION 'market_filter exceeds maximum length';
  END IF;
  IF property_type_filter IS NOT NULL AND LENGTH(property_type_filter) > 200 THEN
    RAISE EXCEPTION 'property_type_filter exceeds maximum length';
  END IF;
  IF broker_role_filter IS NOT NULL AND LENGTH(broker_role_filter) > 200 THEN
    RAISE EXCEPTION 'broker_role_filter exceeds maximum length';
  END IF;
  IF entity_type_filter IS NOT NULL AND LENGTH(entity_type_filter) > 50 THEN
    RAISE EXCEPTION 'entity_type_filter exceeds maximum length';
  END IF;

  -- Total records (unfiltered, for header badge)
  SELECT COUNT(*)::bigint INTO total_rec FROM visibility_records;

  -- Stats from filtered data
  WITH filtered AS (
    SELECT * FROM visibility_records vr
    WHERE (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
      AND (entity_type_filter IS NULL OR vr.entity_type = entity_type_filter)
  ),
  prompt_stats AS (
    SELECT
      COUNT(DISTINCT prompt) AS total_prompts,
      COUNT(DISTINCT CASE WHEN entity_type = 'broker' THEN name END) AS unique_brokers,
      COUNT(DISTINCT CASE WHEN entity_type = 'brokerage' THEN name END) AS unique_brokerages,
      COUNT(DISTINCT CASE WHEN entity_type = 'NONE' THEN prompt END) AS none_prompts
    FROM filtered
  )
  SELECT jsonb_build_object(
    'totalRecords', total_rec,
    'totalPrompts', ps.total_prompts,
    'uniqueBrokers', ps.unique_brokers,
    'uniqueBrokerages', ps.unique_brokerages,
    'nonePrompts', ps.none_prompts,
    'blindSpotPercentage', CASE WHEN ps.total_prompts > 0
      THEN ROUND((ps.none_prompts::numeric / ps.total_prompts * 100), 1)
      ELSE 0 END
  ) INTO stats_obj
  FROM prompt_stats ps;

  -- Filter options (always from full dataset, not filtered)
  SELECT jsonb_build_object(
    'markets', COALESCE((SELECT jsonb_agg(m ORDER BY m) FROM (SELECT DISTINCT market AS m FROM visibility_records WHERE market IS NOT NULL AND market != '') sub), '[]'::jsonb),
    'propertyTypes', COALESCE((SELECT jsonb_agg(pt ORDER BY pt) FROM (SELECT DISTINCT property_type AS pt FROM visibility_records WHERE property_type IS NOT NULL AND property_type != '') sub), '[]'::jsonb),
    'brokerRoles', COALESCE((SELECT jsonb_agg(br ORDER BY br) FROM (SELECT DISTINCT broker_role AS br FROM visibility_records WHERE broker_role IS NOT NULL AND broker_role != '') sub), '[]'::jsonb),
    'entityTypes', COALESCE((SELECT jsonb_agg(et ORDER BY et) FROM (SELECT DISTINCT entity_type AS et FROM visibility_records WHERE entity_type IS NOT NULL AND entity_type != '') sub), '[]'::jsonb)
  ) INTO filters_obj;

  -- Top 15 brokerages
  WITH filtered AS (
    SELECT * FROM visibility_records vr
    WHERE (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
      AND (entity_type_filter IS NULL OR vr.entity_type = entity_type_filter)
  ),
  brokerage_counts AS (
    SELECT name, COUNT(*)::bigint AS mentions
    FROM filtered
    WHERE entity_type = 'brokerage'
    GROUP BY name
  ),
  total AS (
    SELECT COALESCE(SUM(mentions), 0)::numeric AS total_mentions FROM brokerage_counts
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'name', bc.name,
        'mentions', bc.mentions,
        'percentage', CASE WHEN t.total_mentions > 0
          THEN ROUND((bc.mentions::numeric / t.total_mentions * 100), 1)
          ELSE 0 END
      ) ORDER BY bc.mentions DESC
    ),
    '[]'::jsonb
  ) INTO top_brokerages_arr
  FROM (SELECT * FROM brokerage_counts ORDER BY mentions DESC LIMIT 15) bc
  CROSS JOIN total t;

  result := jsonb_build_object(
    'stats', stats_obj,
    'filters', filters_obj,
    'topBrokerages', top_brokerages_arr
  );

  RETURN result;
END;
$function$;

-- =============================================================
-- get_vieweo_top_brokers: returns top brokers with details
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_vieweo_top_brokers(
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  broker_role_filter text DEFAULT NULL,
  entity_type_filter text DEFAULT NULL,
  result_limit integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF result_limit IS NOT NULL AND (result_limit < 1 OR result_limit > 200) THEN
    RAISE EXCEPTION 'result_limit must be between 1 and 200';
  END IF;

  WITH filtered AS (
    SELECT * FROM visibility_records vr
    WHERE vr.entity_type = 'broker'
      AND vr.name != COALESCE(vr.brokerage, '')
      AND (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
  ),
  broker_agg AS (
    SELECT
      name,
      COALESCE(MAX(brokerage), '') AS brokerage,
      COUNT(*)::bigint AS mentions,
      array_agg(DISTINCT market) FILTER (WHERE market IS NOT NULL) AS markets,
      array_agg(DISTINCT property_type) FILTER (WHERE property_type IS NOT NULL) AS asset_classes
    FROM filtered
    GROUP BY name
    ORDER BY mentions DESC
    LIMIT result_limit
  ),
  all_brokers AS (
    SELECT
      name,
      COALESCE(MAX(brokerage), '') AS brokerage,
      COUNT(*)::bigint AS mentions,
      array_agg(DISTINCT market) FILTER (WHERE market IS NOT NULL) AS markets,
      array_agg(DISTINCT property_type) FILTER (WHERE property_type IS NOT NULL) AS asset_classes
    FROM filtered
    GROUP BY name
    ORDER BY mentions DESC
  )
  SELECT jsonb_build_object(
    'topBrokers', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'name', ba.name,
          'brokerage', ba.brokerage,
          'mentions', ba.mentions,
          'markets', COALESCE(to_jsonb(ba.markets), '[]'::jsonb),
          'assetClasses', COALESCE(to_jsonb(ba.asset_classes), '[]'::jsonb)
        ) ORDER BY ba.mentions DESC
      ) FROM broker_agg ba),
      '[]'::jsonb
    ),
    'allBrokers', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'name', ab.name,
          'brokerage', ab.brokerage,
          'mentions', ab.mentions,
          'markets', COALESCE(to_jsonb(ab.markets), '[]'::jsonb),
          'assetClasses', COALESCE(to_jsonb(ab.asset_classes), '[]'::jsonb)
        ) ORDER BY ab.mentions DESC
      ) FROM all_brokers ab),
      '[]'::jsonb
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- =============================================================
-- get_vieweo_prompts: returns prompt explorer data  
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_vieweo_prompts(
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  broker_role_filter text DEFAULT NULL,
  entity_type_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  WITH filtered AS (
    SELECT * FROM visibility_records vr
    WHERE (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
      AND (entity_type_filter IS NULL OR vr.entity_type = entity_type_filter)
  ),
  prompt_data AS (
    SELECT
      prompt,
      MAX(market) AS market,
      MAX(property_type) AS property_type,
      MAX(broker_role) AS broker_role,
      COALESCE(array_agg(DISTINCT entity_display) FILTER (WHERE entity_type = 'broker' AND entity_display IS NOT NULL), '{}') AS brokers,
      COALESCE(array_agg(DISTINCT name) FILTER (WHERE entity_type = 'brokerage'), '{}') AS brokerages,
      bool_or(entity_type IN ('broker', 'brokerage')) AS has_entity
    FROM filtered
    GROUP BY prompt
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'prompt', pd.prompt,
        'market', COALESCE(pd.market, ''),
        'propertyType', COALESCE(pd.property_type, ''),
        'brokerRole', COALESCE(pd.broker_role, ''),
        'brokers', to_jsonb(pd.brokers),
        'brokerages', to_jsonb(pd.brokerages),
        'hasEntity', pd.has_entity
      )
    ),
    '[]'::jsonb
  ) INTO result
  FROM prompt_data pd;

  RETURN result;
END;
$function$;

-- =============================================================
-- get_vieweo_raw_data: returns raw data with pagination
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_vieweo_raw_data(
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  broker_role_filter text DEFAULT NULL,
  entity_type_filter text DEFAULT NULL,
  search_query text DEFAULT NULL,
  page_limit integer DEFAULT 100,
  page_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  sanitized_search text;
BEGIN
  IF page_limit IS NOT NULL AND (page_limit < 1 OR page_limit > 500) THEN
    RAISE EXCEPTION 'page_limit must be between 1 and 500';
  END IF;

  IF search_query IS NOT NULL THEN
    sanitized_search := REPLACE(REPLACE(LOWER(search_query), '%', '\%'), '_', '\_');
  END IF;

  WITH filtered AS (
    SELECT name, brokerage, entity_type, market, property_type, broker_role, prompt
    FROM visibility_records vr
    WHERE (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
      AND (entity_type_filter IS NULL OR vr.entity_type = entity_type_filter)
      AND (sanitized_search IS NULL OR (
        LOWER(vr.name) LIKE '%' || sanitized_search || '%'
        OR LOWER(COALESCE(vr.brokerage, '')) LIKE '%' || sanitized_search || '%'
        OR LOWER(vr.market) LIKE '%' || sanitized_search || '%'
        OR LOWER(vr.prompt) LIKE '%' || sanitized_search || '%'
      ))
    ORDER BY vr.created_at DESC
    LIMIT page_limit OFFSET page_offset
  ),
  total AS (
    SELECT COUNT(*)::bigint AS cnt
    FROM visibility_records vr
    WHERE (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
      AND (entity_type_filter IS NULL OR vr.entity_type = entity_type_filter)
      AND (sanitized_search IS NULL OR (
        LOWER(vr.name) LIKE '%' || sanitized_search || '%'
        OR LOWER(COALESCE(vr.brokerage, '')) LIKE '%' || sanitized_search || '%'
        OR LOWER(vr.market) LIKE '%' || sanitized_search || '%'
        OR LOWER(vr.prompt) LIKE '%' || sanitized_search || '%'
      ))
  )
  SELECT jsonb_build_object(
    'rows', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'name', f.name,
        'brokerage', COALESCE(f.brokerage, ''),
        'entity_type', COALESCE(f.entity_type, ''),
        'market', f.market,
        'property_type', COALESCE(f.property_type, ''),
        'broker_role', COALESCE(f.broker_role, ''),
        'prompt', f.prompt
      )) FROM filtered f),
      '[]'::jsonb
    ),
    'totalCount', (SELECT cnt FROM total)
  ) INTO result;

  RETURN result;
END;
$function$;

-- =============================================================
-- get_vieweo_all_brokerages: for search functionality  
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_vieweo_all_brokerages(
  market_filter text DEFAULT NULL,
  property_type_filter text DEFAULT NULL,
  broker_role_filter text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  WITH filtered AS (
    SELECT * FROM visibility_records vr
    WHERE vr.entity_type = 'brokerage'
      AND (market_filter IS NULL OR vr.market = market_filter)
      AND (property_type_filter IS NULL OR vr.property_type = property_type_filter)
      AND (broker_role_filter IS NULL OR vr.broker_role = broker_role_filter)
  ),
  brokerage_counts AS (
    SELECT name, COUNT(*)::bigint AS mentions
    FROM filtered
    GROUP BY name
  ),
  total AS (
    SELECT COALESCE(SUM(mentions), 0)::numeric AS total_mentions FROM brokerage_counts
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'name', bc.name,
        'mentions', bc.mentions,
        'percentage', CASE WHEN t.total_mentions > 0
          THEN ROUND((bc.mentions::numeric / t.total_mentions * 100), 1)
          ELSE 0 END
      ) ORDER BY bc.mentions DESC
    ),
    '[]'::jsonb
  ) INTO result
  FROM brokerage_counts bc
  CROSS JOIN total t;

  RETURN result;
END;
$function$;

-- =============================================================
-- Indexes to support these queries
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_visibility_records_entity_type ON visibility_records(entity_type);
CREATE INDEX IF NOT EXISTS idx_visibility_records_market ON visibility_records(market);
CREATE INDEX IF NOT EXISTS idx_visibility_records_entity_type_name ON visibility_records(entity_type, name);
CREATE INDEX IF NOT EXISTS idx_visibility_records_property_type ON visibility_records(property_type);
CREATE INDEX IF NOT EXISTS idx_visibility_records_broker_role ON visibility_records(broker_role);
CREATE INDEX IF NOT EXISTS idx_lovable_prompts_primary_market ON lovable_prompts(primary_market);
CREATE INDEX IF NOT EXISTS idx_lovable_prompts_property_type ON lovable_prompts(property_type);
CREATE INDEX IF NOT EXISTS idx_lovable_prompts_broker_role ON lovable_prompts(broker_role);
CREATE INDEX IF NOT EXISTS idx_lovable_prompts_submarket ON lovable_prompts(submarket);
CREATE INDEX IF NOT EXISTS idx_lovable_entities_normalized_brokerage ON lovable_entities(normalized_brokerage);
