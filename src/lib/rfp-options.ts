import { createClient } from "./supabase";

// Branch options
export const branchOptions = [
  "India",
  "Dubai",
  "Kilowa"
];

// RFP Status type
export type RfpStatus = {
  id: number;
  name: string;
};

/**
 * Fetch all RFP statuses from the database
 * This is only used for populating dropdowns
 */
export async function fetchRfpStatuses(): Promise<RfpStatus[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('rfp_status')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching RFP statuses:', error);
    // Return hardcoded fallback values if DB fetch fails
    return [
      { id: 1, name: 'Pending' },
      { id: 2, name: 'Approved' },
      { id: 3, name: 'Rejected' },
      { id: 4, name: 'In Review' },
      { id: 5, name: 'Completed' },
      { id: 6, name: 'In Progress' },
      { id: 7, name: 'On Hold' },
      { id: 8, name: 'Cancelled' }
    ];
  }
  
  return data || [];
}

/**
 * Get a status name by its ID - DEPRECATED
 * The rfps table should use the status column directly, not status_id
 */
export async function getStatusNameById(statusId: number): Promise<string> {
  console.warn('getStatusNameById is deprecated. Use status string directly instead.');
  
  // Hardcoded status names to avoid unnecessary API calls
  const statusMap: { [key: number]: string } = {
    1: 'Pending',
    2: 'Approved',
    3: 'Rejected',
    4: 'In Review',
    5: 'Completed',
    6: 'In Progress',
    7: 'On Hold',
    8: 'Cancelled'
  };
  
  return statusMap[statusId] || '';
}

/**
 * Get a status ID by its name - DEPRECATED
 * The rfps table should use the status column directly, not status_id
 */
export async function getStatusIdByName(statusName: string): Promise<number | null> {
  console.warn('getStatusIdByName is deprecated. Use status string directly instead.');
  
  // Hardcoded status IDs to avoid unnecessary API calls
  const statusMap: { [key: string]: number } = {
    'Pending': 1,
    'Approved': 2,
    'Rejected': 3,
    'In Review': 4,
    'Completed': 5,
    'In Progress': 6,
    'On Hold': 7,
    'Cancelled': 8
  };
  
  return statusMap[statusName] || null;
} 