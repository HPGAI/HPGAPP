'use client'

import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      // Create a hidden iframe to clear Google's auth state before initiating log out
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = 'https://accounts.google.com/logout'
      document.body.appendChild(iframe)
      
      // Wait for the iframe to load
      await new Promise(resolve => {
        iframe.onload = resolve
        // Timeout in case onload doesn't fire
        setTimeout(resolve, 1000)
      })
      
      // Remove the iframe
      document.body.removeChild(iframe)
      
      // Sign out from Supabase with global scope to invalidate all sessions
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear all storage 
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Force reload to completely reset application state
      window.location.href = '/auth/login?force=true&ts=' + Date.now()
    } catch (error) {
      console.error('Error signing out:', error)
      // Force reload even if there was an error
      window.location.href = '/auth/login?force=true&ts=' + Date.now()
    }
  }

  return (
    <Button onClick={handleLogout} variant="outline">
      Sign out
    </Button>
  )
} 