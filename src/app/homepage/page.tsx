import { redirect } from 'next/navigation'
import { getServerClient } from '../../lib/supabase'
import Breadcrumb from '../../components/breadcrumb'

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
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <Breadcrumb items={[{ label: 'Homepage' }]} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
        <p className="mb-4">
          This is your homepage where you can access all features of the app.
        </p>
      </div>
    </div>
  )
} 