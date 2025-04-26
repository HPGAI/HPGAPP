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
        <User className="mr-1 h-4 w-4" />
        Profile
      </Link>
    </nav>
  );
} 