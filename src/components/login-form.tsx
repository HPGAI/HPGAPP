'use client'

import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  // Always consider we're coming from logout to force a fresh login
  const forceNewLogin = true
  
  useEffect(() => {
    if (forceNewLogin) {
      // Clear Google's auth state first by loading Google's logout page in a hidden iframe
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = 'https://accounts.google.com/logout'
      document.body.appendChild(iframe)
      
      const cleanupIframe = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }
      
      // Remove iframe after load or timeout
      iframe.onload = cleanupIframe
      setTimeout(cleanupIframe, 1000)
    }
  }, [])

  const handleSocialLogin = async (provider: 'google') => {
    try {
      // Generate a unique ID to ensure no caching
      const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2)
      
      // Always try to sign out first to clear any existing sessions
      await supabase.auth.signOut()
      
      // Start a new OAuth flow with parameters that force a fresh login
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?ts=${uniqueId}`,
          queryParams: {
            // Force user to select their account
            prompt: 'select_account',
            // Force re-authentication
            access_type: 'offline',
            // Always require consent
            approval_prompt: 'force',
            // Use a unique state to prevent any caching
            state: uniqueId,
            // Don't use any login hints to prevent auto-selection
            login_hint: '',
            // Disable including granted scopes to force fresh consent
            include_granted_scopes: 'false',
            // Add a nonce for added security
            nonce: Math.random().toString(36).substring(2)
          }
        },
      })
    } catch (error) {
      console.error('Error starting OAuth flow:', error)
      
      // If there's an error, try refreshing the page
      window.location.href = `/auth/login?error=true&ts=${Date.now()}`
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={() => handleSocialLogin('google')}
        className="flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path
            fill="currentColor"
            d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
          />
        </svg>
        Sign in with Google
      </Button>
    </div>
  )
} 