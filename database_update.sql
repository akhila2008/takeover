-- Create ai_analysis_cache table for persisting dashboard state
CREATE TABLE IF NOT EXISTS public.ai_analysis_cache (
  id text PRIMARY KEY, -- e.g. "Monthly-January-2026" or "Annual-2026"
  business_id text DEFAULT 'default' REFERENCES public.business_metrics(id) ON DELETE CASCADE,
  document_hashes jsonb DEFAULT '[]'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  charts jsonb DEFAULT '{}'::jsonb,
  ai_output jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'completed', -- 'processing', 'completed', 'failed'
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) to allow public access for this demo
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on ai_analysis_cache" ON public.ai_analysis_cache;
CREATE POLICY "Allow public read/write on ai_analysis_cache" ON public.ai_analysis_cache FOR ALL USING (true) WITH CHECK (true);
