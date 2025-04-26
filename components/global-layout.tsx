"use client";

import Link from 'next/link';
import GlobalNav from './global-nav';

interface GlobalLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  userName?: string | null;
  userMenu?: React.ReactNode;
}

export default function GlobalLayout({ 
  children, 
  showNav = true,
  userName,
  userMenu 
}: GlobalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/protected" className="text-xl font-bold flex items-center">
                <img 
                  src="/favicon.ico" 
                  alt="HPG Logo" 
                  className="w-8 h-8 mr-2" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                HPG App
              </Link>
              
              {showNav && (
                <div className="ml-10">
                  <GlobalNav />
                </div>
              )}
            </div>
            
            {userMenu && (
              <div className="flex items-center">
                {userMenu}
              </div>
            )}
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
  );
} 