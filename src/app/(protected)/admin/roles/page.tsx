import React from 'react'
import { getServerClient } from "../../../../lib/supabase";
import RolePermissionManager from './components/RolePermissionManager';

export default async function RolesManagement() {
  const supabase = await getServerClient();
  
  // Get all roles
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, description')
    .order('id');
  
  // Get all permissions
  const { data: permissions } = await supabase
    .from('permissions')
    .select('id, name, description, resource, action')
    .order('resource', { ascending: true });
  
  // Get role_permissions
  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('role_id, permission_id');
  
  // Format roles with their permissions
  const formattedRoles = roles?.map(role => {
    // Get role's permissions
    const permissionIds = rolePermissions
      ?.filter(rp => rp.role_id === role.id)
      .map(rp => rp.permission_id) || [];
    
    return {
      ...role,
      permissionIds
    };
  });

  // Group permissions by resource
  const groupedPermissions = permissions?.reduce((groups: Record<string, any[]>, permission) => {
    const resource = permission.resource;
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(permission);
    return groups;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <RolePermissionManager 
          roles={formattedRoles || []} 
          permissions={permissions || []} 
          groupedPermissions={groupedPermissions || {}} 
        />
      </div>
    </div>
  )
} 