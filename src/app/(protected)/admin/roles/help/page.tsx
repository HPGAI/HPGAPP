import React from 'react';

export default function RolesHelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role System Documentation</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Understanding Roles</h2>
        
        <div className="prose max-w-none">
          <p>
            The application uses a role-based access control (RBAC) system to determine what 
            actions users can perform and what parts of the application they can access.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Available Roles</h3>
          
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Role</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-left">Access Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3 font-medium">Developer</td>
                <td className="border p-3">Super Admin with highest level privileges</td>
                <td className="border p-3">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Highest</span>
                </td>
              </tr>
              <tr>
                <td className="border p-3 font-medium">Admin</td>
                <td className="border p-3">Administrator with full access to manage the application</td>
                <td className="border p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">High</span>
                </td>
              </tr>
              <tr>
                <td className="border p-3 font-medium">Manager</td>
                <td className="border p-3">Limited administrative access for management tasks</td>
                <td className="border p-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Medium</span>
                </td>
              </tr>
              <tr>
                <td className="border p-3 font-medium">User</td>
                <td className="border p-3">Basic user with limited access</td>
                <td className="border p-3">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Low</span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Role Hierarchy</h3>
          
          <p>
            Roles follow a hierarchy where higher-level roles typically have all the permissions of lower-level roles plus additional ones:
          </p>
          
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Developer</strong> (Super Admin) - Has all permissions including system-level access</li>
            <li><strong>Admin</strong> - Can manage users, roles, and permissions</li>
            <li><strong>Manager</strong> - Can manage resources but not users or system settings</li>
            <li><strong>User</strong> - Basic application access</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Default Role System</h2>
        
        <div className="prose max-w-none">
          <p>
            Every user has a <strong>default_role_id</strong> in their profile which indicates their primary role in the system. 
            This determines various aspects of their experience:
          </p>
          
          <ul className="list-disc pl-6 mb-6">
            <li><strong>UI Experience</strong> - The default role determines which interface the user sees</li>
            <li><strong>Permission Set</strong> - Influences which actions are immediately available</li>
            <li><strong>Navigation</strong> - Controls which sections of the application are visible</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Multiple Roles</h3>
          
          <p>
            Users can have multiple roles assigned simultaneously. While their default role determines their 
            primary experience, they still have all the permissions from their other assigned roles.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Changing Default Role</h3>
          
          <p>
            Administrators can change a user's default role through the User Management interface.
            Users can only have a role set as their default if they already have that role assigned.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mt-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">Important Note</h4>
            <p className="text-yellow-800">
              The Developer (Super Admin) role should be assigned with care as it grants the highest level of access.
              For security reasons, only users with the Developer role can promote others to Developer, and this action is logged.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Technical Implementation</h2>
        
        <div className="prose max-w-none">
          <p>
            The role system is implemented through several database tables and functions:
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Database Tables</h3>
          
          <ul className="list-disc pl-6 mb-6">
            <li><strong>roles</strong> - Defines available roles (id, name, description)</li>
            <li><strong>user_roles</strong> - Junction table linking users to their assigned roles</li>
            <li><strong>profiles</strong> - Contains the default_role_id column</li>
            <li><strong>permissions</strong> - Defines available permissions</li>
            <li><strong>role_permissions</strong> - Maps permissions to roles</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Key Functions</h3>
          
          <ul className="list-disc pl-6 mb-6">
            <li><strong>get_my_roles()</strong> - Returns all roles assigned to the current user</li>
            <li><strong>has_admin_access()</strong> - Checks if a user has admin or developer role</li>
            <li><strong>is_super_admin()</strong> - Checks if a user has the developer role</li>
            <li><strong>admin_promote_to_developer()</strong> - Allows admins to promote users to developer role</li>
            <li><strong>set_default_role_by_id()</strong> - Sets a user's default role</li>
            <li><strong>get_user_default_role()</strong> - Retrieves information about a user's default role</li>
          </ul>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mt-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h4>
            <p className="text-blue-800">
              If you need assistance with role management or have questions about permissions,
              please contact a system administrator or developer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 