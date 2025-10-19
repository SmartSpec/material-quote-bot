import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Force use of correct Supabase project - bypasses Lovable's auto-generated client
const SUPABASE_URL = "https://togplvyjetfapnpgcxza.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZ3BsdnlqZXRmYXBucGdjeHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Mjk1NTUsImV4cCI6MjA3NjMwNTU1NX0.oXUHs1K5U5QM_a1pZvsoXgfYzb8Lsegah7nbi00rhwc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
