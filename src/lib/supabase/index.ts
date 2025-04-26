import { createBrowserClient } from '@supabase/ssr'
import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Fallback values for development
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpuscxehaowkqplamsse.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdXNjeGVoYW93a3FwbGFtc3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDE5NzcsImV4cCI6MjA2MTE3Nzk3N30.ow0GergTQQpqUu2k6ajnF7rqJf9YRuHv7pmduM1fd8sI'

/**
 * Create a Supabase client for use in the browser
 */
export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}

/**
 * Create a Supabase client for use in server components
 * Compatible with Next.js 15's async cookies API
 */
export async function getServerClient() {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
} 