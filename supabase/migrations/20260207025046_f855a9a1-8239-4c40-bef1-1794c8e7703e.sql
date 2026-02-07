-- Create visibility_records table for the Vieweo dashboard
CREATE TABLE public.visibility_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  brokerage TEXT,
  entity_display TEXT,
  market TEXT NOT NULL,
  property_type TEXT NOT NULL,
  broker_role TEXT NOT NULL,
  market_asset TEXT,
  market_role TEXT,
  prompt TEXT NOT NULL,
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visibility_records ENABLE ROW LEVEL SECURITY;

-- Public read access for visibility records
CREATE POLICY "Public read access for visibility records"
ON public.visibility_records
FOR SELECT
USING (true);

-- Create email_signups table for landing page
CREATE TABLE public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their email
CREATE POLICY "Anyone can signup with email"
ON public.email_signups
FOR INSERT
WITH CHECK (true);

-- Create audit_requests table
CREATE TABLE public.audit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  brokerage TEXT NOT NULL,
  phone_number TEXT,
  primary_market TEXT,
  asset_class TEXT,
  role TEXT,
  interests TEXT[],
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an audit request
CREATE POLICY "Anyone can submit audit request"
ON public.audit_requests
FOR INSERT
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_visibility_records_entity_type ON public.visibility_records(entity_type);
CREATE INDEX idx_visibility_records_market ON public.visibility_records(market);
CREATE INDEX idx_visibility_records_property_type ON public.visibility_records(property_type);
CREATE INDEX idx_visibility_records_broker_role ON public.visibility_records(broker_role);