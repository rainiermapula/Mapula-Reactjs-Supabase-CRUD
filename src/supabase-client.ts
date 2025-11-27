import { createClient } from '@supabase/supabase-js'


const supabaseUrl_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;


export const supabase = createClient(supabaseUrl_PROJECT_URL, supabaseKey_ANON_KEY);
