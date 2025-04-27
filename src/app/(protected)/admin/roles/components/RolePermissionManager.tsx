'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Role = {
  id: number
  name: string
  description: string | null
  permissionIds: number[]
}

type Permission = {
  id: number
  name: string
  description: string | null
  resource: string
  action: string
}

export default function RolePermissionManager({ 
  roles,
  permissions,
  groupedPermissions
}: { 
  roles: Role[]
  permissions: Permission[]
  groupedPermissions: Record<string, Permission[]>
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [newRole, setNewRole] = useState({ name: '', description: '' })
  const [showNewRoleForm, setShowNewRoleForm] = useState(false)
  
  const selectedRole = roles.find(r => r.id === selectedRoleId)
  
  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(roleId)
    setMessage(null)
  }
  
  const handleTogglePermission = async (permissionId: number) => {
    if (!selectedRoleId) return
    
    setLoading(true)
    setMessage(null)
    
    const supabase = createClient()
    const hasPermission = selectedRole?.permissionIds.includes(permissionId)
    const permission = permissions.find(p => p.id === permissionId)
    
    try {
      // Call the appropriate RPC function based on whether we're adding or removing the permission
      if (hasPermission) {
        const { data, error } = await supabase.rpc('revoke_permission_from_role', { 
          p_role_name: selectedRole?.name,
          p_permission_name: permission?.name
        })
        
        if (error) throw error
        
        setMessage({ text: 'Permission removed successfully', type: 'success' })
      } else {
        const { data, error } = await supabase.rpc('assign_permission_to_role', { 
          p_role_name: selectedRole?.name,
          p_permission_name: permission?.name
        })
        
        if (error) throw error
        
        setMessage({ text: 'Permission assigned successfully', type: 'success' })
      }
      
      // Reload the page to refresh the data
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error toggling permission:', error)
      setMessage({ text: error.message || 'An error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newRole.name.trim()) {
      setMessage({ text: 'Role name is required', type: 'error' })
      return
    }
    
    setLoading(true)
    setMessage(null)
    
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.rpc('create_role', { 
        p_role_name: newRole.name.trim(),
        p_description: newRole.description.trim() || null
      })
      
      if (error) throw error
      
      setMessage({ text: 'Role created successfully', type: 'success' })
      setNewRole({ name: '', description: '' })
      setShowNewRoleForm(false)
      
      // Reload the page to refresh the data
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error creating role:', error)
      setMessage({ text: error.message || 'An error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Roles list */}
      <div className="w-full md:w-1/3 border-r">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-medium">Roles</h3>
          <button 
            onClick={() => setShowNewRoleForm(!showNewRoleForm)}
            className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            {showNewRoleForm ? 'Cancel' : 'New Role'}
          </button>
        </div>
        
        {showNewRoleForm && (
          <div className="p-4 border-b bg-blue-50">
            <form onSubmit={handleCreateRole}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. editor"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Role description"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Role'}
              </button>
            </form>
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[70vh]">
          {roles.map(role => (
            <div 
              key={role.id} 
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedRoleId === role.id ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelectRole(role.id)}
            >
              <p className="font-medium">{role.name}</p>
              {role.description && (
                <p className="text-sm text-gray-500">{role.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {role.permissionIds.length} permissions
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Permission management */}
      <div className="w-full md:w-2/3 p-6">
        {selectedRole ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">
                {selectedRole.name}
              </h2>
              {selectedRole.description && (
                <p className="text-gray-600">{selectedRole.description}</p>
              )}
            </div>
            
            {message && (
              <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-4">Permissions</h3>
              
              {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                <div key={resource} className="mb-6">
                  <h4 className="text-md font-medium mb-2 bg-gray-100 p-2 rounded">
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {resourcePermissions.map(permission => {
                      const hasPermission = selectedRole.permissionIds.includes(permission.id)
                      
                      return (
                        <div key={permission.id} className="border rounded p-3 flex justify-between items-center">
                          <div>
                            <span className="font-medium">{permission.action}</span>
                            {permission.description && (
                              <p className="text-sm text-gray-500">{permission.description}</p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleTogglePermission(permission.id)}
                            disabled={loading}
                            className={`px-3 py-1 rounded text-sm ${
                              hasPermission 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {hasPermission ? 'Remove' : 'Assign'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Select a role from the list to manage permissions
          </div>
        )}
      </div>
    </div>
  )
} 