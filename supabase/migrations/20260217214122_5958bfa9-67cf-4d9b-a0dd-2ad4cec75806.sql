
CREATE OR REPLACE FUNCTION public.get_co_mentioned_brokerages(target_brokerage text)
RETURNS TABLE(brokerage text, co_mentions bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF target_brokerage IS NULL OR LENGTH(target_brokerage) = 0 THEN
    RAISE EXCEPTION 'target_brokerage is required';
  END IF;
  IF LENGTH(target_brokerage) > 200 THEN
    RAISE EXCEPTION 'target_brokerage exceeds maximum length (200 chars)';
  END IF;

  RETURN QUERY
  WITH target_prompts AS (
    SELECT DISTINCT e.prompt_hash
    FROM lovable_entities e
    WHERE COALESCE(e.normalized_brokerage, e.brokerage, e.name) = target_brokerage
  ),
  co_brokerages AS (
    SELECT
      COALESCE(e.normalized_brokerage, e.brokerage, e.name) AS brokerage,
      COUNT(DISTINCT e.prompt_hash)::bigint AS co_mentions
    FROM lovable_entities e
    WHERE e.prompt_hash IN (SELECT prompt_hash FROM target_prompts)
      AND COALESCE(e.normalized_brokerage, e.brokerage, e.name) != target_brokerage
      AND COALESCE(e.normalized_brokerage, e.brokerage, e.name) IS NOT NULL
    GROUP BY COALESCE(e.normalized_brokerage, e.brokerage, e.name)
  )
  SELECT cb.brokerage, cb.co_mentions
  FROM co_brokerages cb
  ORDER BY cb.co_mentions DESC;
END;
$$;
