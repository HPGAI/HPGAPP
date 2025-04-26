import { redirect } from 'next/navigation';
import { getServerClient } from "../../lib/supabase";
import AppHeader from "../../components/app-header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Get session using the helper function
    const supabase = await getServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Handle session error
    if (error) {
      console.error("Auth session error:", error);
      // Continue as unauthenticated
      redirect('/auth/login?error=session_error');
    }
    
    // Redirect if not authenticated
    if (!session) {
      console.log("No session found, redirecting to login");
      redirect('/auth/login');
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
    );
  } catch (error) {
    console.error("Critical error in protected layout:", error);
    
    // If anything fails critically, redirect to login
    redirect('/auth/login?error=layout_error');
  }
} 