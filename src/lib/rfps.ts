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

export type RfpFilters = {
  search?: string;
  status?: string;
  branch?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
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

/**
 * Get filtered RFPs with server-side filtering and pagination
 */
export async function getFilteredRfps(filters: RfpFilters = {}) {
  const supabase = createClient();
  
  // Default values
  const {
    search = '',
    status,
    branch,
    category,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    sortBy = 'id',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10
  } = filters;
  
  // Start building the query
  let query = supabase
    .from('rfps')
    .select('*', { count: 'exact' });
  
  // Apply search filter (across multiple columns)
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,proposal_no.ilike.%${search}%,file_no.ilike.%${search}%,operator.ilike.%${search}%`
    );
  }
  
  // Apply specific filters
  if (status) {
    query = query.eq('status', status);
  }
  
  if (branch) {
    query = query.eq('branch', branch);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  // Date range filters
  if (dateFrom) {
    query = query.gte('request_date', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('request_date', dateTo);
  }
  
  // Amount range filters
  if (minAmount !== undefined) {
    query = query.gte('quoted_amount', minAmount);
  }
  
  if (maxAmount !== undefined) {
    query = query.lte('quoted_amount', maxAmount);
  }
  
  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);
  
  // Execute the query
  const { data, error, count } = await query;
  
  if (error) {
    console.error('Error fetching filtered RFPs:', error);
    throw new Error('Failed to fetch filtered RFPs');
  }
  
  return {
    data: data as Rfp[],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0
  };
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