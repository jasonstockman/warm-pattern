import { createClient } from '@supabase/supabase-js'

// Get values from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkcapjvaqvlqhurnxyka.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2FwanZhcXZscWh1cm54eWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzU2ODksImV4cCI6MjA0OTk1MTY4OX0.dFqVBrkHbcwMpJVs41F4Ttc2STH-aveqy0EopYAmIfY'

// Verify that we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your environment variables.')
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 