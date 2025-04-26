import { createClient } from '@/lib/supabase/client';

export type Rfp = {
  id: number;
  branch: string | null;
  proposal_no: string | null;
  file_no: string | null;
  name: string | null;
  status: string | null;
  request_date: string | null;
  deadline: string | null;
  sent_date: string | null;
  quoted_amount: number | null;
  revised_amount: number | null;
  currency: string | null;
  conversion: number | null;
  location_id: string | null;
  project_details_id: string | null;
  category: string | null;
  sub_category: string | null;
  operator: string | null;
  brand: string | null;
  contacts_id: string | null;
  lead_generator: string | null;
  lead_closer: string | null;
  followup_id: string | null;
  drive: string | null;
  path: string | null;
};

export async function getRfps() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('rfps')
    .select('*')
    .order('id', { ascending: false });
    
  if (error) {
    console.error('Error fetching RFPs:', error);
    throw new Error('Failed to fetch RFPs');
  }
  
  return data as Rfp[];
}

export async function getRfp(id: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('rfps')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching RFP with ID ${id}:`, error);
    throw new Error(`Failed to fetch RFP with ID ${id}`);
  }
  
  return data as Rfp;
}

export async function createRfp(rfp: Omit<Rfp, 'id'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('rfps')
    .insert(rfp)
    .select('*')
    .single();
    
  if (error) {
    console.error('Error creating RFP:', error);
    throw new Error('Failed to create RFP');
  }
  
  return data as Rfp;
}

export async function updateRfp(id: number, rfp: Partial<Rfp>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('rfps')
    .update(rfp)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    console.error(`Error updating RFP with ID ${id}:`, error);
    throw new Error(`Failed to update RFP with ID ${id}`);
  }
  
  return data as Rfp;
}

export async function deleteRfp(id: number) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('rfps')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting RFP with ID ${id}:`, error);
    throw new Error(`Failed to delete RFP with ID ${id}`);
  }
  
  return true;
} 