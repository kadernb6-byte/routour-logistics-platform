// Supabase client for frontend — connects via HTTPS REST API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fkcmwugccvxgcxvyodka.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY213dWdjY3Z4Z2N4dnlvZGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjc3OTcsImV4cCI6MjA4NzY0Mzc5N30.gXcVkINu4aRiwnnj8CRFRJ05O17LaqJn3BIOI5pHtF0';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
