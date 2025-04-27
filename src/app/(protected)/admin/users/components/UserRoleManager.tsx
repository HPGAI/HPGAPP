'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PromoteToDevRole from './PromoteToDevRole'

type User = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  roleIds: number[]
  defaultRoleName: string
}

type Role = {
  id: number
  name: string
  description: string | null
}

export default function UserRoleManager({ 
  users, 
  roles 
}: { 
  users: User[]
  roles: Role[]
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  
  // Log the number of users for debugging
  useEffect(() => {
    console.log(`UserRoleManager loaded with ${users.length} users`);
  }, [users]);
  
  const selectedUser = users.find(u => u.id === selectedUserId)
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
    setMessage(null)
  }
  
  const handleToggleRole = async (roleId: number) => {
    if (!selectedUserId) return
    
    setLoading(true)
    setMessage(null)
    
    const supabase = createClient()
    const hasRole = selectedUser?.roleIds.includes(roleId)
    
    try {
      // Call the appropriate RPC function based on whether we're adding or removing the role
      if (hasRole) {
        const { data, error } = await supabase.rpc('revoke_role', { 
          p_user_id: selectedUserId,
          p_role_name: roles.find(r => r.id === roleId)?.name
        })
        
        if (error) throw error
        
        setMessage({ text: 'Role removed successfully', type: 'success' })
      } else {
        const { data, error } = await supabase.rpc('assign_role', { 
          p_user_id: selectedUserId,
          p_role_name: roles.find(r => r.id === roleId)?.name
        })
        
        if (error) throw error
        
        setMessage({ text: 'Role assigned successfully', type: 'success' })
      }
      
      // Reload the page to refresh the data
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error toggling role:', error)
      setMessage({ text: error.message || 'An error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  // Function to get user's role info
  const getUserRoleInfo = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_user_roles', {
        p_user_id: userId
      })
      
      if (error) throw error
      
      // Format the roles information
      const rolesInfo = data.map((role: any) => role.name).join(', ')
      alert(`User Roles:\n\nUser: ${selectedUser?.email}\nRoles: ${rolesInfo}`)
    } catch (error) {
      console.error('Error fetching roles info:', error)
    }
  }

  // If no users are available, show a message
  if (users.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">No Users Found</h3>
        <p className="text-gray-500">
          There are no users available or you don't have permission to view them.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Users list */}
      <div className="w-full md:w-1/3 border-r">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Users ({users.length})</h3>
        </div>
        <div className="overflow-y-auto max-h-[70vh]">
          {users.map(user => (
            <div 
              key={user.id} 
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelectUser(user.id)}
            >
              <div className="flex items-center">
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt={`${user.first_name} ${user.last_name}`} 
                    className="w-8 h-8 rounded-full mr-3"
                  />
                )}
                <div>
                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-gray-400">Roles: {user.roleIds.length}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user.id) getUserRoleInfo(user.id);
                      }}
                      className="ml-1 text-xs text-blue-500 hover:text-blue-700"
                    >
                      ?
                    </button>
                  </div>
                  {user.roleIds.includes(roles.find(r => r.name === 'developer')?.id || 0) && (
                    <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-800 py-0.5 px-1.5 rounded">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Role management */}
      <div className="w-full md:w-2/3 p-6">
        {selectedUser ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">
                {selectedUser.first_name} {selectedUser.last_name}
              </h2>
              <p className="text-gray-600">{selectedUser.email}</p>
            </div>
            
            {message && (
              <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Assigned Roles</h3>
              <div className="grid grid-cols-1 gap-3">
                {roles.map(role => {
                  const hasRole = selectedUser.roleIds.includes(role.id)
                  
                  return (
                    <div key={role.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleRole(role.id)}
                            disabled={loading}
                            className={`px-3 py-1 rounded text-sm ${
                              hasRole 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {hasRole ? 'Remove' : 'Assign'}
                          </button>
                        </div>
                      </div>
                      
                      {role.description && (
                        <p className="text-sm text-gray-500">{role.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Super Admin Promotion Section */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Super Admin Privileges</h3>
              <PromoteToDevRole 
                userId={selectedUser.id} 
                userEmail={selectedUser.email || ''} 
                hasDevRole={selectedUser.roleIds.includes(
                  roles.find(r => r.name === 'developer')?.id || 0
                )}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Select a user from the list to manage their roles
          </div>
        )}
      </div>
    </div>
  )
} 