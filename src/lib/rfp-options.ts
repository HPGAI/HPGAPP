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
 */
export async function fetchRfpStatuses(): Promise<RfpStatus[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('rfp_status')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching RFP statuses:', error);
    throw new Error('Failed to fetch RFP statuses');
  }
  
  return data || [];
}

/**
 * Get a status name by its ID
 */
export async function getStatusNameById(statusId: number): Promise<string> {
  if (!statusId) return '';
  
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('rfp_status')
      .select('name')
      .eq('id', statusId)
      .single();
      
    if (error) throw error;
    
    return data.name || '';
  } catch (error) {
    console.error(`Error fetching status name for ID ${statusId}:`, error);
    return '';
  }
}

/**
 * Get a status ID by its name
 */
export async function getStatusIdByName(statusName: string): Promise<number | null> {
  if (!statusName) return null;
  
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('rfp_status')
      .select('id')
      .eq('name', statusName)
      .single();
      
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error(`Error fetching status ID for name "${statusName}":`, error);
    return null;
  }
} 