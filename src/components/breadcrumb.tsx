'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbProps {
  items?: Array<{
    label: string
    href?: string
  }>
}

export default function Breadcrumb({ items = [] }: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Default breadcrumb based on the path if no items are provided
  const paths = pathname.split('/').filter(Boolean)
  
  const breadcrumbItems = items.length > 0 
    ? items 
    : paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`
        // Prettify the path segment for display
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
        return { label, href }
      })

  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        <li>
          <Link 
            href="/homepage" 
            className="flex items-center hover:text-gray-900"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link 
                href={item.href} 
                className="hover:text-gray-900"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 