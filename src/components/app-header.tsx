import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import ServerLogo from './server-logo'
import ProfileDropdown from './profile-dropdown'

interface AppHeaderProps {
  user: User | null
}

export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="bg-white border-b py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ServerLogo />
            
            <nav className="ml-10 flex items-center space-x-4">
              <Link href="/homepage" className="text-gray-600 hover:text-gray-900">
                Homepage
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
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
  )
} 