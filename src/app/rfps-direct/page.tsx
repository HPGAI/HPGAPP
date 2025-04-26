import { redirect } from "next/navigation";
import { getServerClient } from "../../lib/supabase";

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RfpsDirectPage() {
  // Create the Supabase client using our helper
  const supabase = await getServerClient();
  
  // Get session using the supabase client
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is logged in, redirect to RFPs page
  if (session) {
    redirect('/rfps');
  }
  
  // Otherwise redirect to login 
  redirect('/auth/login');
} 