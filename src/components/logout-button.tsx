'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const supabase = createClient()

  const handleLogout = async () => {
    try {
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