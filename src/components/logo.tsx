'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const pathname = usePathname()
  const homePath = pathname.startsWith('/homepage') || pathname.startsWith('/profile') 
    ? '/homepage' 
    : '/'

  return (
    <Link href={homePath} className={`block ${className}`}>
      <Image
        src="/images/hpg-logo.png"
        alt="HPG Logo"
        width={90}
        height={60}
        className="h-8 w-auto"
        priority
      />
    </Link>
  )
} 