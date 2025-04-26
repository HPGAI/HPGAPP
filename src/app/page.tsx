import { redirect } from 'next/navigation';
import { getServerClient } from '../lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  } else {
    // Redirect unauthenticated users to login
    redirect('/auth/login');
  }
  
  // This won't render since we're redirecting
  return null;
}
