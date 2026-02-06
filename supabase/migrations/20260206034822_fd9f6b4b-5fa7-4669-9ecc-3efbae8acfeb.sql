-- Update brokerage_mentions_total view to count submarkets instead of markets
DROP VIEW IF EXISTS brokerage_mentions_total;
CREATE VIEW brokerage_mentions_total AS
SELECT 
  COALESCE(e.brokerage, e.name) AS brokerage,
  COUNT(*) AS total_mentions,
  COUNT(DISTINCT p.prompt_hash) AS unique_prompts,
  COUNT(DISTINCT p.submarket) AS markets_present
FROM lovable_entities e
JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
GROUP BY COALESCE(e.brokerage, e.name);

-- Set security invoker
ALTER VIEW brokerage_mentions_total SET (security_invoker = on);