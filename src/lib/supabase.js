import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://okeogjphgpxlmfpddiwc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZW9nanBoZ3B4bG1mcGRkaXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjQzNjYsImV4cCI6MjA4MjYwMDM2Nn0.gp68_IngC8DwGIgYuPMj2de9Kt8ihLikfgmnzyqO_Ng'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
