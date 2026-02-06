-- Update brokerage_mentions_total view to include both primary markets and submarkets count
DROP VIEW IF EXISTS brokerage_mentions_total;
CREATE VIEW brokerage_mentions_total AS
SELECT 
  COALESCE(e.brokerage, e.name) AS brokerage,
  COUNT(*) AS total_mentions,
  COUNT(DISTINCT p.prompt_hash) AS unique_prompts,
  COUNT(DISTINCT p.primary_market) AS primary_markets_present,
  COUNT(DISTINCT p.submarket) AS submarkets_present
FROM lovable_entities e
JOIN lovable_prompts p ON e.prompt_hash = p.prompt_hash
GROUP BY COALESCE(e.brokerage, e.name);

-- Set security invoker
ALTER VIEW brokerage_mentions_total SET (security_invoker = on);