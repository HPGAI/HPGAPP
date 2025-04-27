import Link from 'next/link';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Help link */}
      <div className="flex justify-end mb-4">
        <Link 
          href="/admin/roles/help" 
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 mr-1" />
          Role System Documentation
        </Link>
      </div>
      
      {children}
    </div>
  );
} 