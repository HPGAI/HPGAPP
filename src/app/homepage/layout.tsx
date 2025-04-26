import { redirect } from 'next/navigation'
import { getServerClient } from '../../lib/supabase'
import AppHeader from '../../components/app-header'
import AppFooter from '../../components/app-footer'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomepageLayout({
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
      <AppHeader user={user} />
      
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