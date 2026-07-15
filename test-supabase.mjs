import { createClient } from '@supabase/supabase-js'; try { createClient('placeholder', 'placeholder'); console.log('Success'); } catch(e) { console.log('ERROR:', e.message); }
