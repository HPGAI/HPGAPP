import { redirect } from 'next/navigation'
import { getServerClient } from '../../lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

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
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Quick Access</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold mb-2 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-orange-500" />
                RFPs Management
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Create, view, and manage all your Request for Proposals in one place.
              </p>
              <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                <Link href="/rfps">
                  Go to RFPs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 