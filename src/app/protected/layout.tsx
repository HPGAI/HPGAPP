import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '../../lib/supabase/index'
import ProfileDropdown from '../../components/profile-dropdown'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">HPG App</Link>
              
              <nav className="ml-10 flex items-center space-x-4">
                <Link href="/protected" className="text-gray-600 hover:text-gray-900">
                  Homepage
                </Link>
                <Link href="/protected/profile" className="text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} HPG App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 