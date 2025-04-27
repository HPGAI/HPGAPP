import { createServerClient } from '@supabase/ssr'
// Only import cookies in environments where it's supported
const isAppDir = process.env.NEXT_RUNTIME === 'nodejs' && typeof window === 'undefined';
let cookies: any;

// Dynamic import for App Router environments only
if (isAppDir) {
  try {
    // This will only execute in App Router server environments
    cookies = require('next/headers').cookies;
  } catch (e) {
    console.error('Failed to import next/headers:', e);
  }
}

// Fallback values for development
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpuscxehaowkqplamsse.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdXNjeGVoYW93a3FwbGFtc3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDE5NzcsImV4cCI6MjA2MTE3Nzk3N30.ow0GergTQQpqUu2k6ajnF7rqJf9YRuHv7pmduM1fd8sI'

/**
 * Creates a Supabase client for use in App Router server components
 * Uses next/headers which is only available in the App Router
 */
export async function createAppServerClient() {
  console.log('Creating App Router server client with URL:', SUPABASE_URL);
  
  try {
    // Check if we're in an environment that supports cookies
    if (!isAppDir || !cookies) {
      throw new Error('This function can only be used in App Router server components');
    }
    
    // Get cookie store from Next.js App Router - IMPORTANT: await the cookies
    const cookieStore = await cookies();
    
    // Create the Supabase client
    const client = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        }
      }
    )
    
    return client;
  } catch (error) {
    console.error('Error creating App Router server client:', error);
    throw error;
  }
} 