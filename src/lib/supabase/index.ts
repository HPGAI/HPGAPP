import { createBrowserClient } from '@supabase/ssr'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

// Fallback values for development
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpuscxehaowkqplamsse.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdXNjeGVoYW93a3FwbGFtc3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDE5NzcsImV4cCI6MjA2MTE3Nzk3N30.ow0GergTQQpqUu2k6ajnF7rqJf9YRuHv7pmduM1fd8sI'

/**
 * Create a Supabase client for use in the browser (client components)
 */
export function createClient() {
  try {
    console.log('Creating browser Supabase client for', SUPABASE_URL);
    return createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  } catch (err) {
    console.error('Failed to create browser client:', err);
    // Return a minimal client that won't crash the app
    return createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }
}

/**
 * Create a Supabase client for use in server components (App Router only)
 * DO NOT USE IN PAGES DIRECTORY! Use createPagesServerClient instead.
 */
export async function getServerClient() {
  console.log('Creating server Supabase client');
  
  try {
    // We can't safely use dynamic imports in server components, so we're going to 
    // use a relative import approach instead
    if (typeof window !== 'undefined') {
      throw new Error('getServerClient should only be used in server components');
    }
    
    // Check if we're in App Router - if next/headers is available
    const isAppRouter = process.env.NEXT_RUNTIME === 'nodejs' && typeof window === 'undefined';
    
    if (!isAppRouter) {
      console.warn('getServerClient() was called outside of App Router context - this may cause errors');
      
      // Fallback client with no cookie handling for non-App Router environments
      return createServerClient(
        SUPABASE_URL, 
        SUPABASE_ANON_KEY, 
        { cookies: {} as any }
      );
    }
    
    // For use in server components only - this avoids a direct import
    // that would break in the Pages Router
    return await import('./server').then(m => m.createAppServerClient());
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    // Fallback client with no cookie handling
    return createServerClient(
      SUPABASE_URL, 
      SUPABASE_ANON_KEY, 
      { cookies: {} as any }
    );
  }
}

/**
 * For use in the Pages Router getServerSideProps and API routes
 */
export function createPagesServerClient(context: { req: any; res: any }) {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly`);
        },
        remove(name: string, options: CookieOptions) {
          context.res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0`);
        },
      },
    }
  );
} 