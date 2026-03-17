import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqdyrtylynvpxwzhbrys.supabase.co';
const supabaseKey = 'sb_publishable_EeNGMTswx35foOIPNKf8bA_SIR790P-';

export const supabase = createClient(supabaseUrl, supabaseKey);
