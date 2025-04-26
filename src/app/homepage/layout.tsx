import { redirect } from 'next/navigation'
import { getServerClient } from '../../lib/supabase/index'
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
      
      <AppFooter />
    </div>
  )
} 