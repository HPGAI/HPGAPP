import React from 'react'
import { getServerClient } from "../../../lib/supabase";

export default async function AdminDashboard() {
  const supabase = await getServerClient();
  
  // Get stats
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  const { count: rolesCount } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true });
    
  const { count: permissionsCount } = await supabase
    .from('permissions')
    .select('*', { count: 'exact', head: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Users</h3>
          <p className="text-3xl font-bold mt-2">{usersCount || 0}</p>
          <a href="/admin/users" className="text-blue-600 text-sm mt-2 block">Manage Users →</a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Roles</h3>
          <p className="text-3xl font-bold mt-2">{rolesCount || 0}</p>
          <a href="/admin/roles" className="text-blue-600 text-sm mt-2 block">Manage Roles →</a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
          <p className="text-3xl font-bold mt-2">{permissionsCount || 0}</p>
          <a href="/admin/permissions" className="text-blue-600 text-sm mt-2 block">Manage Permissions →</a>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Administration Guide</h2>
        <p className="mb-4">Welcome to the admin panel. Here you can manage users, roles, and permissions for your application.</p>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Quick Start:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Assign roles to users in the Users section</li>
            <li>Create and manage roles in the Roles section</li>
            <li>Configure permissions for roles in the Permissions section</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Available Roles:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Admin:</strong> Full access to all features</li>
            <li><strong>Developer:</strong> Advanced access for technical management</li>
            <li><strong>Manager:</strong> Limited access to manage key resources</li>
            <li><strong>User:</strong> Basic access to application features</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 