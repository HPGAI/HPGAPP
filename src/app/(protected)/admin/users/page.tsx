import React from 'react'
import { getServerClient } from "../../../../lib/supabase";
import UserRoleManager from './components/UserRoleManager';

export default async function UsersManagement() {
  const supabase = await getServerClient();
  
  // Get diagnostic information first
  const { data: diagnosticData, error: diagnosticError } = await supabase
    .rpc('get_user_diagnostic_info');
    
  console.log('User diagnostic info:', diagnosticData, diagnosticError);
  
  // Get all users with their profiles
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name, 
      last_name,
      email,
      avatar_url,
      created_at
    `)
    .order('created_at', { ascending: false });
    
  console.log('Users query result:', { count: users?.length, error: usersError });
  
  // Get all roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, description');
    
  console.log('Roles query result:', { count: roles?.length, error: rolesError });
  
  // Get user_roles assignments
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('user_id, role_id');
    
  console.log('User roles query result:', { count: userRoles?.length, error: userRolesError });
  
  // If there are errors or no users found, return an error message
  if (usersError || !users || users.length === 0) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">Users Management</h1>
        
        <div className="bg-orange-100 border border-orange-300 text-orange-800 p-4 rounded">
          <h2 className="font-bold text-lg mb-2">Diagnostic Information</h2>
          <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-orange-200 overflow-auto max-h-[300px]">
            {JSON.stringify({
              diagnosticData,
              diagnosticError: diagnosticError?.message,
              usersError: usersError?.message,
              rolesError: rolesError?.message,
              userRolesError: userRolesError?.message,
              userCount: users?.length || 0,
              roleCount: roles?.length || 0,
              userRolesCount: userRoles?.length || 0
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
  
  // Format data for the component
  const formattedUsers = users?.map(user => {
    // Get user's roles
    const userRoleIds = userRoles
      ?.filter(ur => ur.user_id === user.id)
      .map(ur => ur.role_id) || [];
    
    // Determine highest privilege role for display purposes
    let defaultRoleName = 'None';
    
    // Check for developer role first
    const isDeveloper = userRoleIds.some(roleId => 
      roles?.find(r => r.id === roleId)?.name === 'developer'
    );
    
    if (isDeveloper) {
      defaultRoleName = 'developer';
    } else {
      // Check for admin role next
      const isAdmin = userRoleIds.some(roleId => 
        roles?.find(r => r.id === roleId)?.name === 'admin'
      );
      
      if (isAdmin) {
        defaultRoleName = 'admin';
      } else if (userRoleIds.length > 0 && roles) {
        // Use first role found
        const firstRoleId = userRoleIds[0];
        const firstRole = roles.find(r => r.id === firstRoleId);
        if (firstRole) {
          defaultRoleName = firstRole.name;
        }
      }
    }
    
    return {
      ...user,
      roleIds: userRoleIds,
      defaultRoleName
    };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="text-sm text-gray-500">
          Showing {users.length} users
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <UserRoleManager users={formattedUsers || []} roles={roles || []} />
      </div>
    </div>
  )
} 