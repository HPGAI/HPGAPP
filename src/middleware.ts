import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// This middleware applies to all routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  try {
    // Call updateSession to refresh auth tokens and get a response
    const response = await updateSession(request)
    
    // Add cache control headers to prevent caching of auth state
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Create Supabase client for auth checks
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // Cookies already set by updateSession
          },
          remove(name, options) {
            // Cookies already handled by updateSession
          },
        },
      }
    )

    // Get user session for route protection
    const { data } = await supabase.auth.getSession()
    const session = data.session
    
    const url = new URL(request.url)
    
    // Special handling for login page
    if (url.pathname === '/auth/login') {
      // Check for force logout parameters
      const hasLogoutParam = url.searchParams.has('logged_out') || url.searchParams.has('force')
      
      // If user is logged in and trying to access login page without logout params,
      // redirect to protected page
      if (session && !hasLogoutParam) {
        return NextResponse.redirect(new URL('/protected', request.url))
      }
      
      // Otherwise, allow access to login page
      return response
    }

    // If the request is for a protected route, verify authentication
    if (url.pathname.startsWith('/protected')) {
      // If no session, redirect to login
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Error in middleware:', error)
    // Continue without auth in development
    return NextResponse.next()
  }
} 