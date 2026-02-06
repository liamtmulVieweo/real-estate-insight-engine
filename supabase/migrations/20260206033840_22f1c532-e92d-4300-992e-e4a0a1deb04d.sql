-- Fix security definer view by setting security_invoker
ALTER VIEW brokerage_market_rankings SET (security_invoker = on);