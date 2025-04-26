"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { createClient } from "../../../lib/supabase";

type Rfp = {
  id: number;
  branch: string | null;
  proposal_no: string | null;
  file_no: string | null;
  name: string | null;
  status: string | null;
  request_date: string | null;
  deadline: string | null;
  quoted_amount: number | null;
  currency: string | null;
};

interface SimpleRfpsTableProps {
  initialData: Rfp[];
}

export function SimpleRfpsTable({ initialData }: SimpleRfpsTableProps) {
  console.log("SimpleRfpsTable component rendering with", initialData.length, "records");
  
  const [data, setData] = useState<Rfp[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [showDebug, setShowDebug] = useState(true);
  
  // Function to refresh data from the database
  const refreshData = async () => {
    setIsRefreshing(true);
    console.log("SimpleRfpsTable: Starting data refresh");
    
    try {
      const supabase = createClient();
      console.log("SimpleRfpsTable: Supabase client created for refresh");
      
      const { data: rfps, error } = await supabase
        .from('rfps')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.error('Error refreshing RFPs data:', error);
        throw error;
      }
      
      setData(rfps || []);
      setLastRefreshed(new Date().toLocaleTimeString());
      console.log('RFPs data refreshed:', rfps?.length || 0, 'records');
    } catch (err) {
      console.error('Failed to refresh RFPs data:', err);
      // Keep using existing data, don't update state
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format date strings for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    // Log initial data when component mounts
    console.log("SimpleRfpsTable: Initial data", initialData);
  }, [initialData]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          {showDebug && (
            <div className="text-sm text-gray-500">
              Last refreshed: {lastRefreshed}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? "Hide" : "Show"} Debug
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      
      {showDebug && (
        <div className="bg-gray-50 border rounded p-4 mb-4 text-sm">
          <h3 className="font-medium mb-2">SimpleRfpsTable Debug Info</h3>
          <p>Records in initialData: {initialData.length}</p>
          <p>Records in state: {data.length}</p>
          <p>Component rendered at: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
      
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-full table-auto">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Proposal #</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Request Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Deadline</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No RFPs found
                </td>
              </tr>
            ) : (
              data.map((rfp) => (
                <tr key={rfp.id} className="border-b hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm">{rfp.id}</td>
                  <td className="px-4 py-3 text-sm">{rfp.proposal_no || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{rfp.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${rfp.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                      ${rfp.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${rfp.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                      ${!rfp.status ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {rfp.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(rfp.request_date)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(rfp.deadline)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {rfp.quoted_amount 
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: rfp.currency || 'USD'
                        }).format(rfp.quoted_amount)
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 text-sm text-muted-foreground">
          Showing {data.length} RFPs
        </div>
      </div>
    </div>
  );
} 