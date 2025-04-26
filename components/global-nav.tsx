"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, User } from 'lucide-react';

export default function GlobalNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex items-center space-x-4">
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
        className={`px-4 py-2 rounded-md flex items-center font-medium shadow-sm ${
          pathname === '/rfps' || pathname.startsWith('/rfps/') 
            ? 'bg-orange-600 text-white' 
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        <FileText className="mr-2 h-5 w-5" />
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
        <User className="mr-1 h-4 w-4" />
        Profile
      </Link>
    </nav>
  );
} 