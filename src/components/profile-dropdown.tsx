'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { createClient } from '@/lib/supabase/client'

export default function ProfileDropdown({ 
  user 
}: { 
  user: { 
    email?: string | null, 
    user_metadata?: { avatar_url?: string } | null
  } | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  const handleSignOut = async () => {
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
  
  const displayName = user?.email?.split('@')[0] || 'User'
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={displayName} />
          <AvatarFallback>{(user?.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={displayName} />
                <AvatarFallback>{(user?.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{displayName}</p>
              </div>
            </div>
          </div>
          
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Your Profile
          </Link>
          
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
} 