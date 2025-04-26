import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Force dynamic rendering for this route to prevent caching
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange the code for a session - this is a critical part of the PKCE flow
      // DO NOT sign out before this as it will invalidate the code verifier in localStorage
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth error:', error)
        const errorResponse = NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(error.message)}&ts=${Date.now()}`)
        // Add cache control headers
        errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        errorResponse.headers.set('Pragma', 'no-cache')
        errorResponse.headers.set('Expires', '0')
        return errorResponse
      }
      
      // Verify the session was created successfully
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        const noSessionResponse = NextResponse.redirect(`${requestUrl.origin}/auth/error?error=No session created&ts=${Date.now()}`)
        // Add cache control headers
        noSessionResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        noSessionResponse.headers.set('Pragma', 'no-cache')
        noSessionResponse.headers.set('Expires', '0')
        return noSessionResponse
      }
      
      // Successful authentication - redirect to protected area
      const successResponse = NextResponse.redirect(`${requestUrl.origin}/protected?login_success=true&ts=${Date.now()}`)
      // Add cache control headers to prevent caching of auth state
      successResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      successResponse.headers.set('Pragma', 'no-cache')
      successResponse.headers.set('Expires', '0')
      return successResponse
    } catch (err) {
      console.error('Unexpected error during authentication:', err)
      const errorResponse = NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Unexpected error&ts=${Date.now()}`)
      // Add cache control headers
      errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      errorResponse.headers.set('Pragma', 'no-cache')
      errorResponse.headers.set('Expires', '0')
      return errorResponse
    }
  }

  // No code provided - redirect to login page
  const redirectResponse = NextResponse.redirect(`${requestUrl.origin}/auth/login?missing_code=true&ts=${Date.now()}`)
  // Add cache control headers
  redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  redirectResponse.headers.set('Pragma', 'no-cache')
  redirectResponse.headers.set('Expires', '0')
  return redirectResponse
} 