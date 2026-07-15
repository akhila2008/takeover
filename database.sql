-- Create business_metrics table
CREATE TABLE IF NOT EXISTS public.business_metrics (
  id text PRIMARY KEY,
  health_score numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  active_customers numeric DEFAULT 0,
  monthly_expenses numeric DEFAULT 0,
  cash_flow numeric DEFAULT 0,
  financial_score numeric DEFAULT 0,
  inventory_score numeric DEFAULT 0,
  customer_score numeric DEFAULT 0,
  growth_score numeric DEFAULT 0,
  operational_score numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id text PRIMARY KEY,
  company_name text DEFAULT '',
  industry text DEFAULT '',
  business_type text DEFAULT '',
  scale text DEFAULT '',
  goals jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id text PRIMARY KEY,
  business_id text REFERENCES public.business_metrics(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  date_uploaded text NOT NULL,
  day integer NOT NULL DEFAULT 1,
  month text NOT NULL DEFAULT 'January',
  year integer NOT NULL DEFAULT 2026,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ai_reports_history table
CREATE TABLE IF NOT EXISTS public.ai_reports_history (
  id text PRIMARY KEY,
  business_id text REFERENCES public.business_metrics(id) ON DELETE CASCADE,
  analysis_date text NOT NULL,
  selected_period text NOT NULL,
  health_score numeric DEFAULT 0,
  financial_score numeric DEFAULT 0,
  inventory_score numeric DEFAULT 0,
  customer_score numeric DEFAULT 0,
  growth_score numeric DEFAULT 0,
  operational_score numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  executive_summary text DEFAULT '',
  recommendations jsonb DEFAULT '[]'::jsonb,
  predictions text DEFAULT '',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row for our single-tenant demo
INSERT INTO public.business_metrics (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.business_profiles (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) to allow public access for this demo
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on business_metrics" ON public.business_metrics;
CREATE POLICY "Allow public read/write on business_metrics" ON public.business_metrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on business_profiles" ON public.business_profiles;
CREATE POLICY "Allow public read/write on business_profiles" ON public.business_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on documents" ON public.documents;
CREATE POLICY "Allow public read/write on documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on ai_reports_history" ON public.ai_reports_history;
CREATE POLICY "Allow public read/write on ai_reports_history" ON public.ai_reports_history FOR ALL USING (true) WITH CHECK (true);
