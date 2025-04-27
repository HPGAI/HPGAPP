import React from 'react';
import { getServerClient } from "../../../../lib/supabase";
import { redirect } from 'next/navigation';

export default async function SystemLogs() {
  const supabase = await getServerClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check super admin status specifically
  const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
  
  // Only super admins can access this page
  if (!isSuperAdmin) {
    console.log(`User ${user?.email} tried to access system logs without super admin rights`);
    redirect('/admin?error=insufficient_permissions');
  }
  
  // Get auth logs for tracking
  const { data: logs, error: logsError } = await supabase
    .from('auth_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  // Group logs by date for better display
  const groupedLogs: Record<string, any[]> = {};
  
  logs?.forEach(log => {
    const date = new Date(log.created_at).toLocaleDateString();
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });
  
  // Get unique event types for filtering
  const eventTypes = Array.from(new Set(logs?.map(log => log.event_type)));
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          Super Admin Only
        </div>
      </div>
      
      {logsError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6">
          Error fetching logs: {logsError.message}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Log Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-700 font-medium">Total Logs</p>
                <p className="text-2xl font-bold">{logs?.length || 0}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-green-700 font-medium">Event Types</p>
                <p className="text-2xl font-bold">{eventTypes?.length || 0}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-sm text-yellow-700 font-medium">Days With Logs</p>
                <p className="text-2xl font-bold">{Object.keys(groupedLogs).length || 0}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-purple-700 font-medium">Admin Actions</p>
                <p className="text-2xl font-bold">
                  {logs?.filter(log => 
                    log.event_type.includes('admin') || 
                    log.event_type.includes('role')
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Event Logs</h2>
            </div>
            
            <div className="divide-y">
              {Object.keys(groupedLogs).sort().reverse().map(date => (
                <div key={date} className="p-6">
                  <h3 className="text-md font-medium text-gray-700 mb-4">{date}</h3>
                  
                  <div className="space-y-4">
                    {groupedLogs[date].map(log => (
                      <div key={log.id} className="bg-gray-50 p-4 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                              log.event_type.includes('error') ? 'bg-red-100 text-red-800' :
                              log.event_type.includes('admin') ? 'bg-purple-100 text-purple-800' :
                              log.event_type.includes('role') ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.event_type}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <span className="text-xs bg-gray-200 rounded px-2 py-1">
                            ID: {log.user_id ? `${log.user_id.substring(0, 8)}...` : 'System'}
                          </span>
                        </div>
                        
                        <details className="mt-3">
                          <summary className="text-sm text-blue-600 cursor-pointer">View Details</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Showing last 100 log entries. Full logs are available in the database.
          </div>
        </>
      )}
    </div>
  );
} 