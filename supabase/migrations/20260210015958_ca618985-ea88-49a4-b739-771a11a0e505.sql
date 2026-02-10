-- Fix security definer views by setting security_invoker
ALTER VIEW public.brokerage_mentions_total SET (security_invoker = true);
ALTER VIEW public.brokerage_mentions_segmented SET (security_invoker = true);
ALTER VIEW public.brokerage_market_rankings SET (security_invoker = true);
ALTER VIEW public.domain_attribution_by_brokerage SET (security_invoker = true);