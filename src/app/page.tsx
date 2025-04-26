import { redirect } from "next/navigation";
import { getServerClient } from '../lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Create the Supabase client using our helper
  const supabase = await getServerClient();
  
  // Get session using the supabase client
  const { data: { session } } = await supabase.auth.getSession();
  
  // If the user is already logged in, redirect them to the protected homepage
  if (session) {
    redirect('/homepage');
  }
  
  // Otherwise redirect to login page directly
  redirect('/auth/login');
}
