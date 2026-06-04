import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzcsegvlfaebwpxipqxx.supabase.co';
const supabaseAnonKey = 'sb_publishable_aX-Pv8Sq7rhaPKTkyWkEqA_JwvmT8Xz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);