import { createBrowserClient } from '@supabase/ssr'

// Fallback values for development
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpuscxehaowkqplamsse.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdXNjeGVoYW93a3FwbGFtc3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDE5NzcsImV4cCI6MjA2MTE3Nzk3N30.ow0GergTQQpqUu2k6ajnF7rqJf9YRuHv7pmduM1fd8sI'

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
} 