import React from 'react';
import { getServerClient } from "../../../../lib/supabase";
import { redirect } from 'next/navigation';

export default async function SystemSettings() {
  const supabase = await getServerClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check super admin status specifically
  const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
  
  // Only super admins can access this page
  if (!isSuperAdmin) {
    console.log(`User ${user?.email} tried to access system settings without super admin rights`);
    redirect('/admin?error=insufficient_permissions');
  }
  
  // Get database statistics for super admin
  const { data: dbStats, error: dbStatsError } = await supabase.rpc('get_database_stats');
  
  // Get auth logs for tracking
  const { data: recentLogs } = await supabase
    .from('auth_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          Super Admin Only
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          
          {dbStatsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              Error fetching database stats: {dbStatsError.message}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-blue-700 font-medium">Total Users</p>
                  <p className="text-2xl font-bold">{dbStats?.user_count || 'N/A'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-green-700 font-medium">Total RFPs</p>
                  <p className="text-2xl font-bold">{dbStats?.rfp_count || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-purple-700 font-medium">Admin Users</p>
                  <p className="text-2xl font-bold">{dbStats?.admin_count || 'N/A'}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-yellow-700 font-medium">Super Admins</p>
                  <p className="text-2xl font-bold">{dbStats?.super_admin_count || 'N/A'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Database Info</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Version: {dbStats?.db_version || 'Unknown'}</p>
                  <p>Size: {dbStats?.db_size || 'Unknown'}</p>
                  <p>Last Backup: {dbStats?.last_backup || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Super Admin Tools</h2>
          
          <div className="space-y-4">
            <button 
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Reset System (Coming Soon)</span>
            </button>
            
            <button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Maintenance Mode (Coming Soon)</span>
            </button>
            
            <button 
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
              </svg>
              <span>Database Backup (Coming Soon)</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent System Logs</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLogs?.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user_id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <details>
                        <summary>View</summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 