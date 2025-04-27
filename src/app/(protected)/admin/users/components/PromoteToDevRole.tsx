'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type PromoteProps = {
  userId: string
  userEmail: string
  hasDevRole: boolean
}

export default function PromoteToDevRole({ userId, userEmail, hasDevRole }: PromoteProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [currentUserIsDeveloper, setCurrentUserIsDeveloper] = useState(false)
  
  // Check if the current user has developer role
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('is_super_admin')
        
        if (error) throw error
        
        setCurrentUserIsDeveloper(!!data)
      } catch (error) {
        console.error('Error checking current user role:', error)
      }
    }
    
    checkCurrentUserRole()
  }, [])
  
  const handlePromote = async () => {
    if (!confirm(`Are you sure you want to promote ${userEmail} to developer (super admin) role? This grants them the highest level of system privileges.`)) {
      return;
    }
    
    setLoading(true)
    setMessage(null)
    
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('admin_promote_to_developer', {
        p_user_id: userId
      })
      
      if (error) throw error
      
      setMessage({ 
        text: `Successfully promoted ${userEmail} to developer (super admin) role`, 
        type: 'success' 
      })
      
      // Reload after 2 seconds to refresh the data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error: any) {
      console.error('Error promoting user:', error)
      setMessage({ text: error.message || 'An error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  // If the user already has the dev role, don't show the button
  if (hasDevRole) {
    return (
      <div className="bg-purple-100 text-purple-800 text-sm rounded px-3 py-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        User already has developer (super admin) privileges
      </div>
    )
  }
  
  // If current user is not a developer, hide the promotion button
  if (!currentUserIsDeveloper) {
    return (
      <div className="bg-gray-100 text-gray-500 text-sm rounded px-3 py-2">
        Only developer (super admin) users can promote others to this role
      </div>
    )
  }
  
  return (
    <div>
      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <button
        onClick={handlePromote}
        disabled={loading}
        className="flex items-center px-3 py-2 text-sm font-medium rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        Promote to Developer (Super Admin)
      </button>
      
      <p className="mt-2 text-xs text-gray-500">
        This will grant the user full super admin privileges, including access to system settings and logs.
      </p>
    </div>
  )
} 