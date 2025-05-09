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
          set() {
            // Cookies already set by updateSession
          },
          remove() {
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
      // redirect to homepage
      if (session && !hasLogoutParam) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Otherwise, allow access to login page
      return response
    }
    
    // Handle legacy /homepage/rfps route
    if (url.pathname === '/homepage/rfps') {
      if (session) {
        return NextResponse.redirect(new URL('/rfps', request.url))
      } else {
        return NextResponse.redirect(new URL('/auth/login?returnTo=/rfps', request.url))
      }
    }

    // Handle legacy /protected/rfps route
    if (url.pathname === '/protected/rfps') {
      if (session) {
        return NextResponse.redirect(new URL('/rfps', request.url))
      } else {
        return NextResponse.redirect(new URL('/auth/login?returnTo=/rfps', request.url))
      }
    }

    // Legacy profile route handling
    if (url.pathname === '/homepage/profile') {
      return NextResponse.redirect(new URL('/profile', request.url))
    }

    // Protected routes require authentication
    if (url.pathname.startsWith('/protected') || 
        url.pathname.startsWith('/homepage') || 
        url.pathname.startsWith('/profile') ||
        url.pathname.startsWith('/rfps') ||
        url.pathname === '/dashboard') {
      // If no session, redirect to login
      if (!session) {
        // Store the attempted URL as a return path
        const returnTo = encodeURIComponent(url.pathname)
        return NextResponse.redirect(new URL(`/auth/login?returnTo=${returnTo}`, request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Error in middleware:', error)
    // Continue without auth in development
    return NextResponse.next()
  }
} 