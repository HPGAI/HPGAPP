import React from 'react'
import { getServerClient } from "../../../lib/supabase";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getServerClient();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found, redirecting to login");
    redirect('/login');
  }

  // Log user email for debugging
  console.log(`User authenticated: ${user.email}`);

  // First check if user is a super admin (has developer role)
  const { data: isSuperAdminCheck, error: superAdminError } = await supabase.rpc('is_super_admin');
  
  if (superAdminError) {
    console.error("Error checking super admin status:", superAdminError);
  } else if (isSuperAdminCheck) {
    // If user is a super admin, we can skip other checks and allow access
    console.log(`User ${user.email} is a SUPER ADMIN`);
    // Continue to admin panel, skip all other checks
  } else {
    // Not a super admin, continue with regular admin checks
    console.log(`User ${user.email} is not a super admin, checking for admin privileges`);
    
    // Check for regular admin access
    const { data: hasDirectAccess, error: directAccessError } = await supabase.rpc('has_admin_access');
    
    if (directAccessError) {
      console.error("Error checking direct admin access:", directAccessError);
    }
    
    console.log(`Direct admin access check for ${user.email}: ${hasDirectAccess}`);
    
    // Also check using the standard roles function for comparison
    const { data: userRoles, error: rolesError } = await supabase.rpc('get_my_roles');
    
    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      redirect('/dashboard?error=role_fetch_failed');
    }
    
    // Log roles for debugging
    console.log("User roles:", JSON.stringify(userRoles));
    
    const isAuthorized = userRoles?.some((role: any) => 
      ['admin'].includes(role.name)
    );

    console.log(`User ${user.email} is authorized for admin: ${isAuthorized}`);

    // If not super admin, must pass admin checks
    if (!hasDirectAccess && !isAuthorized) {
      console.log(`User ${user.email} doesn't have admin role, redirecting to dashboard`);
      redirect('/dashboard?error=unauthorized');
    }
  }

  // Get all user roles for the admin UI display
  const { data: userRoles } = await supabase.rpc('get_my_roles');
  const isSuperAdmin = userRoles?.some((role: any) => role.name === 'developer');
  const isAdmin = userRoles?.some((role: any) => role.name === 'admin');

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">
          {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
          {isSuperAdmin && (
            <span className="block text-xs mt-1 bg-purple-700 text-white px-2 py-1 rounded">
              Super Admin Access
            </span>
          )}
        </h2>
        <nav className="space-y-2">
          <a href="/admin" className="block py-2 px-4 rounded hover:bg-gray-800">Dashboard</a>
          <a href="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-800">Users</a>
          <a href="/admin/roles" className="block py-2 px-4 rounded hover:bg-gray-800">Roles</a>
          <a href="/admin/permissions" className="block py-2 px-4 rounded hover:bg-gray-800">Permissions</a>
          {isSuperAdmin && (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <span className="block text-xs uppercase text-gray-500 px-4 py-1">Super Admin Tools</span>
              <a href="/admin/system" className="block py-2 px-4 rounded hover:bg-gray-800 text-purple-300">
                System Settings
              </a>
              <a href="/admin/logs" className="block py-2 px-4 rounded hover:bg-gray-800 text-purple-300">
                System Logs
              </a>
            </>
          )}
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
} 