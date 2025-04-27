import React from 'react'
import { getServerClient } from "../../../../lib/supabase";
import PermissionManagement from './components/PermissionManagement';

export default async function PermissionsManagement() {
  const supabase = await getServerClient();
  
  // Get all permissions
  const { data: permissions } = await supabase
    .from('permissions')
    .select('id, name, description, resource, action')
    .order('resource', { ascending: true })
    .order('action', { ascending: true });
  
  // Get unique resources
  const resources = Array.from(new Set(permissions?.map(p => p.resource) || []));

  // Get all roles for reference
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name');
  
  // Get role_permissions to show which roles have each permission
  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('role_id, permission_id');
  
  // Format permissions with roles that have them
  const formattedPermissions = permissions?.map(permission => {
    // Get roles that have this permission
    const roleIds = rolePermissions
      ?.filter(rp => rp.permission_id === permission.id)
      .map(rp => rp.role_id) || [];
    
    // Get role names
    const roleNames = roles
      ?.filter(r => roleIds.includes(r.id))
      .map(r => r.name) || [];
    
    return {
      ...permission,
      roleIds,
      roleNames
    };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permissions Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <PermissionManagement 
          permissions={formattedPermissions || []} 
          resources={resources} 
          roles={roles || []} 
        />
      </div>
    </div>
  )
} 