'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import ServerLogo from './server-logo'
import ProfileDropdown from './profile-dropdown'
import Breadcrumb from './breadcrumb'

interface AppHeaderProps {
  user: User | null
}

export default function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname.startsWith(path) 
      ? "text-orange-500 font-medium" 
      : "text-gray-600 hover:text-gray-900"
  }
  
  return (
    <>
      <header className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ServerLogo />
              
              <nav className="ml-10 flex items-center space-x-4">
                <Link 
                  href="/homepage" 
                  className={`${isActive('/homepage')} transition-colors`}
                >
                  Homepage
                </Link>
                {/* Additional navigation links can be added here */}
              </nav>
            </div>
            
            <div className="flex items-center">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </header>
      
      <div className="bg-gray-50 border-b py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-4">
          <Breadcrumb />
        </div>
      </div>
    </>
  )
} 