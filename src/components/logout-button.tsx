'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  // Function to log out directly from Google accounts
  const handleGoogleLogout = () => {
    window.open('https://accounts.google.com/Logout', '_blank')
  }

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
    <div className="flex flex-col gap-2">
      <Button onClick={handleLogout} variant="outline">
        Sign out
      </Button>
      <Button 
        onClick={handleGoogleLogout} 
        variant="ghost" 
        size="sm" 
        className="text-xs"
      >
        Sign out of Google
      </Button>
    </div>
  )
} 