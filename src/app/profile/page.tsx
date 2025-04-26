import { redirect } from 'next/navigation'
import { getServerClient } from '../../lib/supabase/index'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
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
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.email || 'User'} />
              <AvatarFallback className="text-2xl">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-lg">{user?.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Authentication Method</h3>
                <p className="text-sm">
                  {user?.app_metadata?.provider || 'Email'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 