import { redirect } from 'next/navigation'
import LogoutButton from '@/components/logout-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerClient } from '../../../lib/supabase'
import { FileText, User } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2 items-center">
          <Button variant="outline" asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/rfps">
              <FileText className="mr-2 h-4 w-4" />
              RFPs
            </Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
        <p className="mb-4">
          This is your dashboard where you can access all features of the app.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RFPs Card */}
          <div className="bg-orange-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-orange-100">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium">RFPs Management</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Create, view, and manage all your Request for Proposals in one place.
            </p>
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/rfps">Go to RFPs</Link>
            </Button>
          </div>
          
          {/* Profile Card */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium">Your Profile</h3>
            </div>
            <p className="text-gray-600 mb-6">
              View and update your profile information and preferences.
            </p>
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              <Link href="/profile">View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 