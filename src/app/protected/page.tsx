import { redirect } from 'next/navigation'
import LogoutButton from '@/components/logout-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerClient } from '../../lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProtectedPage() {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Protected Page</h1>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
        <p className="mb-4">
          This page is protected and can only be accessed by authenticated users.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 