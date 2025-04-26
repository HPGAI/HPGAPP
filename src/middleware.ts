import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

// This middleware applies to all routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const res = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    // Add cache control headers to prevent caching of auth state
    res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
    
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh the session
    const { data: { session } } = await supabase.auth.getSession()
    
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
      return res
    }

    // If the request is for a protected route, verify authentication
    if (url.pathname.startsWith('/protected')) {
      // If no session, redirect to login
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Error in middleware:', error)
    // Continue without auth in development
    return NextResponse.next()
  }
} 