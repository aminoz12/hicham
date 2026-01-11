import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Support both VITE_ and NEXT_PUBLIC_ prefixes for compatibility
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://mrwfmdflbkbprkkwpkld.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  'sb_publishable_TdC96eOAkPj3CLjOrrtrQQ_LsGS9oPn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

