'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Permission = {
  id: number
  name: string
  description: string | null
  resource: string
  action: string
  roleIds: number[]
  roleNames: string[]
}

type Role = {
  id: number
  name: string
}

export default function PermissionManagement({ 
  permissions,
  resources,
  roles
}: { 
  permissions: Permission[]
  resources: string[]
  roles: Role[]
}) {
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    customResource: ''
  })
  const [showNewPermissionForm, setShowNewPermissionForm] = useState(false)
  const [selectedResource, setSelectedResource] = useState<string | 'all'>('all')
  
  const filteredPermissions = selectedResource === 'all' 
    ? permissions 
    : permissions.filter(p => p.resource === selectedResource);
  
  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPermission.name.trim()) {
      setMessage({ text: 'Permission name is required', type: 'error' })
      return
    }
    
    if (!newPermission.resource && !newPermission.customResource) {
      setMessage({ text: 'Resource is required', type: 'error' })
      return
    }
    
    if (!newPermission.action.trim()) {
      setMessage({ text: 'Action is required', type: 'error' })
      return
    }
    
    setLoading(true)
    setMessage(null)
    
    const supabase = createClient()
    
    try {
      const finalResource = newPermission.resource || newPermission.customResource
      
      const { data, error } = await supabase.rpc('create_permission', { 
        p_name: newPermission.name.trim(),
        p_description: newPermission.description.trim() || null,
        p_resource: finalResource.trim(),
        p_action: newPermission.action.trim()
      })
      
      if (error) throw error
      
      setMessage({ text: 'Permission created successfully', type: 'success' })
      setNewPermission({
        name: '',
        description: '',
        resource: '',
        action: '',
        customResource: ''
      })
      setShowNewPermissionForm(false)
      
      // Reload the page to refresh the data
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error creating permission:', error)
      setMessage({ text: error.message || 'An error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium">Filter by Resource:</h3>
          <select 
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="border rounded p-1"
          >
            <option value="all">All Resources</option>
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setShowNewPermissionForm(!showNewPermissionForm)}
          className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          {showNewPermissionForm ? 'Cancel' : 'New Permission'}
        </button>
      </div>
      
      {showNewPermissionForm && (
        <div className="p-4 border-b bg-blue-50">
          <form onSubmit={handleCreatePermission}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Permission Name</label>
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({...newPermission, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. read_documents"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({...newPermission, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Permission description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resource</label>
                <select
                  value={newPermission.resource}
                  onChange={(e) => setNewPermission({
                    ...newPermission, 
                    resource: e.target.value,
                    customResource: e.target.value === 'custom' ? '' : newPermission.customResource
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a resource or custom</option>
                  {resources.map(resource => (
                    <option key={resource} value={resource}>{resource}</option>
                  ))}
                  <option value="custom">Custom Resource</option>
                </select>
              </div>
              
              {newPermission.resource === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Resource</label>
                  <input
                    type="text"
                    value={newPermission.customResource}
                    onChange={(e) => setNewPermission({...newPermission, customResource: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. documents"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <input
                  type="text"
                  value={newPermission.action}
                  onChange={(e) => setNewPermission({...newPermission, action: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. read, create, update, delete"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Permission'}
            </button>
          </form>
        </div>
      )}
      
      {message && (
        <div className={`p-3 m-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Roles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map(permission => (
                <tr key={permission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{permission.resource}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{permission.action}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{permission.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {permission.roleNames.length > 0 ? (
                        permission.roleNames.map(role => (
                          <span key={role} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No roles assigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No permissions found for this resource
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 