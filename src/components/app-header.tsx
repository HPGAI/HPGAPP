'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import ServerLogo from './server-logo'
import ProfileDropdown from './profile-dropdown'
import Breadcrumb from './breadcrumb'
import { FileText, Home, User as UserIcon } from 'lucide-react'

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
                  href="/dashboard" 
                  className={`flex items-center ${
                    pathname === '/dashboard' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
                
                <Link 
                  href="/rfps" 
                  className={`flex items-center ${
                    pathname === '/rfps' || pathname.startsWith('/rfps/') 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="mr-1 h-4 w-4" />
                  RFPs Management
                </Link>
                
                <Link 
                  href="/profile" 
                  className={`flex items-center ${
                    pathname === '/profile' 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserIcon className="mr-1 h-4 w-4" />
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
      
      <div className="bg-gray-50 border-b py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-4">
          <Breadcrumb />
        </div>
      </div>
    </>
  )
} 