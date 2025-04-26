import { redirect } from "next/navigation";
import { getServerClient } from "../../../lib/supabase";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

// This prevents page caching
export const fetchCache = 'force-no-store';

export default async function HomepageRfpsPage() {
  // Create the Supabase client
  const supabase = await getServerClient();
  
  // Get session using the supabase client
  const { data } = await supabase.auth.getSession();
  
  // Redirect using Next.js redirect function directly
  if (data.session) {
    // Using server-side redirect to /rfps
    redirect('/rfps');
  } else {
    // Using server-side redirect to login
    redirect('/auth/login?returnTo=/rfps');
  }
} 