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
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh the session
    await supabase.auth.getSession()

    // If the request is for a protected route, verify authentication
    const url = new URL(request.url)
    if (url.pathname.startsWith('/protected')) {
      const {
        data: { session },
      } = await supabase.auth.getSession()

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