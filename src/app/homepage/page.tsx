import { redirect } from 'next/navigation'
import { getServerClient } from '../../lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Get session using the helper function
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect if not authenticated
  if (!session) {
    redirect('/auth/login')
  }
  
  // Get user details
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
        <p className="mb-4">
          This is your homepage where you can access all features of the app.
        </p>
      </div>
    </div>
  )
} 