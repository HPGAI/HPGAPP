'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Role = {
  id: number
  name: string
  description: string | null
}

export default function RoleDisplay() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [hasDeveloperRole, setHasDeveloperRole] = useState(false)
  
  useEffect(() => {
    const fetchUserRoles = async () => {
      setLoading(true)
      
      try {
        const supabase = createClient()
        
        // Get the current user first
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        
        if (!userData.user) {
          console.error('No authenticated user found')
          setLoading(false)
          return
        }
        
        // Get the user's roles by passing their ID
        const { data, error } = await supabase.rpc('get_user_roles', {
          p_user_id: userData.user.id
        })
        
        if (error) throw error
        
        // Sort roles by privilege level (developer > admin > manager > user)
        const sortedRoles = [...data].sort((a, b) => {
          const roleOrder: Record<string, number> = {
            'developer': 1,
            'admin': 2,
            'manager': 3,
            'user': 4
          }
          
          const aOrder = roleOrder[a.name] || 99
          const bOrder = roleOrder[b.name] || 99
          
          return aOrder - bOrder
        })
        
        setRoles(sortedRoles)
        
        // Check if the user has developer role
        setHasDeveloperRole(
          sortedRoles.some(role => role.name === 'developer')
        )
      } catch (error) {
        console.error('Error fetching user roles:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserRoles()
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-gray-300 animate-spin"></div>
        <span>Loading roles...</span>
      </div>
    )
  }
  
  if (roles.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No roles assigned
      </div>
    )
  }
  
  return (
    <div className="flex flex-col">
      <div className="text-sm font-medium mb-1">Your Roles:</div>
      <div className="flex flex-wrap gap-1">
        {roles.map(role => (
          <span 
            key={role.id}
            className={`text-xs px-2 py-1 rounded ${
              role.name === 'developer' 
                ? 'bg-purple-100 text-purple-800' 
                : role.name === 'admin'
                ? 'bg-blue-100 text-blue-800'
                : role.name === 'manager'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
          </span>
        ))}
      </div>
      
      {hasDeveloperRole && (
        <div className="mt-2 text-xs text-purple-700">
          You have super admin privileges
        </div>
      )}
    </div>
  )
} 