import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Missing Supabase environment variables! App will load but database will fail.');
}

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('Invalid Supabase URL provided in environment variables, falling back to placeholder to prevent crash.', e);
  client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
